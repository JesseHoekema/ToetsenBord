import type { PageServerLoad } from './$types';
import { prisma } from '$lib/prisma';
import { redirect } from '@sveltejs/kit';
import { refreshSomtodayToken, getAllExams } from '@/somtoday';
import { getVakBoekImage } from '$lib/books';
import { getUserFromCookie } from '@/auth';

export const load: PageServerLoad = async ({ cookies }) => {
  const token = cookies.get('session');
  if (!token) throw redirect(303, '/sign-in');

  const session = await getUserFromCookie(token)

  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } });
    throw redirect(303, '/sign-in');
  }

  const user = {
    id: session.id,
    email: session.email,
    name: session.name ?? "User",
    avatar: session.profilePicture?.toString() || ""
  };

  try {
    const refreshtoken = await refreshSomtodayToken(session.id);
    
    const updatedUser = await prisma.user.findUnique({
      where: { id: session.id }
    });
    
    if (updatedUser?.somtodayToken) {
      session.somtodayToken = updatedUser.somtodayToken;
    }
  } catch (error) {
    console.log(error)
  }

  if (!session.somtodayToken) {
    return {
      user,
      exams: [],
      error: 'Je hebt Somtoday niet gekoppeld'
    };
  }

  let exams;
  let error = null;

  try {
    exams = await getAllExams(session.somtodayToken);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Er ging iets mis bij het ophalen van toetsen';
    
    return {
      user,
      exams: [],
      error
    };
  }

  if (!exams || exams.length === 0) {
    return {
      user,
      exams: [],
      error: null
    };
  }

  const mappedExams = await Promise.all(
    exams.map(async (exam: any) => {
      const date = new Date(exam.datum);
      const formattedDate = date.toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long'
      });
      
      const nameSlug = exam.vak
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') 
        .replace(/[^a-z0-9]+/g, '-') 
        .replace(/^-+|-+$/g, ''); 
      
      const dateSlug = date.toISOString().split('T')[0]; 
      
      const examLink = `/exam/${nameSlug}-${dateSlug}`;
      
      let imageUrl = '/';
      try {
        const fetchedImage = await getVakBoekImage(exam.vak);
        if (fetchedImage) {
          imageUrl = fetchedImage;
        }
      } catch (error) {
      }

      return {
        ...exam,
        formattedDate,
        date,
        imageUrl,
        link: examLink
      };
    })
  );

  mappedExams.sort((a, b) => a.date.getTime() - b.date.getTime());

  return {
    user,
    exams: mappedExams,
    error: null
  };
};