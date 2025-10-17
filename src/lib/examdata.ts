import { prisma } from '$lib/prisma';

export async function editNotes(vak: string, dateDue: string, newNotes: string) {
    const existingExam = await prisma.exam.findFirst({
        where: { vak, dateDue: new Date(dateDue) }
    });

    if (existingExam) {
        return prisma.exam.update({
            where: { id: existingExam.id },
            data: { notes: newNotes }
        });
    } else {
        return prisma.exam.create({
            data: {
                vak,
                dateDue: new Date(dateDue),
                notes: newNotes,
                links: [],
                books: []
            }
        });
    }
}
export async function addBook(vak: string, dateDue: string, bookUrl: string) {
    const existingExam = await prisma.exam.findFirst({
        where: { vak, dateDue: new Date(dateDue) }
    });

    if (existingExam) {
        const updatedBooks = [...(existingExam.books as string[]), bookUrl];
        return prisma.exam.update({
            where: { id: existingExam.id },
            data: { books: updatedBooks }
        });
    } else {
        return prisma.exam.create({
            data: {
                vak,
                dateDue: new Date(dateDue),
                notes: "",
                links: [],
                books: [bookUrl]
            }
        });
    }
}

export async function addLink(vak: string, dateDue: string, linkUrl: string) {
    const existingExam = await prisma.exam.findFirst({
        where: { vak, dateDue: new Date(dateDue) }
    });

    if (existingExam) {
        const updatedLinks = [...(existingExam.links as string[]), linkUrl];
        return prisma.exam.update({
            where: { id: existingExam.id },
            data: { links: updatedLinks }
        });
    } else {
        return prisma.exam.create({
            data: {
                vak,
                dateDue: new Date(dateDue),
                notes: "",
                links: [linkUrl],
                books: []
            }
        });
    }
}

export async function removeLink(vak: string, dateDue: string, linkUrl: string) {
  const exam = await prisma.exam.findFirst({
    where: {
      vak,
      dateDue: new Date(dateDue),
    },
  });

  if (!exam) {
    throw new Error("Exam not found");
  }

  const updatedLinks = (exam.links as string[]).filter(link => link !== linkUrl);

  const updatedExam = await prisma.exam.update({
    where: { id: exam.id },
    data: { links: updatedLinks },
  });

  return updatedExam;
}

export async function removeBook(vak: string, dateDue: string, bookName: string) {
  const exam = await prisma.exam.findFirst({
    where: {
      vak,
      dateDue: new Date(dateDue),
    },
  });

  if (!exam) {
    throw new Error("Exam not found");
  }

  const updatedBooks = (exam.books as string[]).filter(book => book !== bookName);

  const updatedExam = await prisma.exam.update({
    where: { id: exam.id },
    data: { books: updatedBooks },
  });

  return updatedExam;
}
