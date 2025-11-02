import { prisma } from '$lib/prisma';

export async function editNotes(userId: number, vak: string, dateDue: string, newNotes: string) {
    const existingHomework = await prisma.homework.findFirst({
        where: { vak, dateDue: new Date(dateDue), userId }
    });

    if (existingHomework) {
        return prisma.homework.update({
            where: { id: existingHomework.id, userId },
            data: { notes: newNotes }
        });
    } else {
        return prisma.homework.create({
            data: {
                vak,
                dateDue: new Date(dateDue),
                userId,
                notes: newNotes,
                links: []
            }
        });
    }
}

export async function addLink(userId: number, vak: string, dateDue: string, linkUrl: string) {
    const existingHomework = await prisma.homework.findFirst({
        where: { vak, dateDue: new Date(dateDue), userId }
    });

    if (existingHomework) {
        const updatedLinks = [...(existingHomework.links as string[]), linkUrl];
        return prisma.homework.update({
            where: { id: existingHomework.id, userId },
            data: { links: updatedLinks }
        });
    } else {
        return prisma.homework.create({
            data: {
                vak,
                dateDue: new Date(dateDue),
                userId,
                notes: "",
                links: [linkUrl]
            }
        });
    }
}

export async function removeLink(userId: number, vak: string, dateDue: string, linkUrl: string) {
  const homework = await prisma.homework.findFirst({
    where: {
      vak,
      dateDue: new Date(dateDue),
      userId
    },
  });

  if (!homework) {
    throw new Error("Homework not found");
  }

  const updatedLinks = (homework.links as string[]).filter(link => link !== linkUrl);

  const updatedHomework = await prisma.homework.update({
    where: { id: homework.id, userId },
    data: { links: updatedLinks },
  });

  return updatedHomework;
}