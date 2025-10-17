import boekenData from './boeken.json';
import { prisma } from '$lib/prisma';

export async function getVakBoekImage(vak: string): Promise<string> {
  if (!vak) throw new Error("Please provide a vak (subject).");

  const FALLBACK_IMAGE = `https://placehold.co/190x250?text=${vak}`;

  const normalizedVak = vak.toLowerCase();

  let boek = boekenData.boeken.find(
    (b: { vak: string; image_url: string }) => b.vak.toLowerCase() === normalizedVak
  );

  if (!boek) {
    boek = boekenData.boeken.find(
      (b: { vak: string; image_url: string }) =>
        b.vak.toLowerCase().includes(normalizedVak) ||
        normalizedVak.includes(b.vak.toLowerCase())
    );
  }

  return boek?.image_url || FALLBACK_IMAGE;
}

export async function addBook(
  title: string, 
  type: string, 
  userId: number, 
  onlineBook?: string
) {
  try {
    const newBook = await prisma.book.create({
      data: {
        title,
        type,
        userId,
        onlineBook,
        importantPages: [],
      },
    });
    return newBook;
  } catch (error) {
    console.error("Error adding book:", error);
    throw error;
  }
}
export async function removeBook(bookId: number, userId: number) {
  try {
    const deletedBook = await prisma.book.delete({
      where: {
        id: bookId,
        userId: userId,
      },
    });
    return deletedBook;
  } catch (error) {
    console.error("Error removing book:", error);
    throw error;
  }
}

export async function getBooks(userId: number) {
  try {
    const books = await prisma.book.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: "desc" },
    });

    return books;
  } catch (error) {
    console.error("Error fetching books:", error);
    throw new Error("Failed to fetch books");
  }
}
function normalize(str: string) {
  return str.toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function getBook(title: string, userId: number) {
  try {
    const books = await prisma.book.findMany({ where: { userId } });

    const normalizedTitle = normalize(title);
    const book = books.find(b => normalize(b.title) === normalizedTitle);

    if (!book) return null;

    const image_url = await getVakBoekImage(book.type);
    return { ...book, image_url };
  } catch (error) {
    console.error("Error fetching book:", error);
    throw new Error("Failed to fetch book");
  }
}
export async function addPage(bookPage: number, bookId: number, userId: number) {
    const book = await prisma.book.findFirst({
        where: { id: bookId, userId },
    });

    if (!book) {
        throw new Error('Book not found or not owned by user');
    }

    const pages: string[] = book.importantPages ? JSON.parse(JSON.stringify(book.importantPages)) : [];

    if (!pages.includes(String(bookPage))) {
        pages.push(String(bookPage));
    }

    const updatedBook = await prisma.book.update({
        where: { id: bookId },
        data: {
            importantPages: pages,
        },
    });

    return updatedBook;
}
export async function removePage(bookPage: number, bookId: number, userId: number) {
    const book = await prisma.book.findFirst({
        where: { id: bookId, userId },
    });

    if (!book) {
        throw new Error('Book not found or not owned by user');
    }

    const pages: string[] = book.importantPages ? JSON.parse(JSON.stringify(book.importantPages)) : [];

    const updatedPages = pages.filter(p => p !== String(bookPage));

    const updatedBook = await prisma.book.update({
        where: { id: bookId },
        data: {
            importantPages: updatedPages,
        },
    });

    return updatedBook;
}

export async function editBook(
  bookId: number,
  userId: number,
  title?: string,
  type?: string,
  onlineBook?: string
) {
  const data: Record<string, any> = {
    title: title ?? '',
    type: type ?? '',
    onlineBook: onlineBook ?? '',
  };

  const updatedBook = await prisma.book.updateMany({
    where: {
      id: bookId,
      userId,
    },
    data,
  });

  if (updatedBook.count === 0) {
    throw new Error('Book not found or not authorized');
  }

  const book = await prisma.book.findUnique({
    where: { id: bookId },
  });

  return book;
}