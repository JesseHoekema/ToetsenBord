import { prisma } from '$lib/prisma';
import { getVakBoekImage } from './books';
import { getIcon } from './icons';


export async function connectWithAccessToken(
    userId: number,
    accessToken: string
): Promise<{ success: boolean; message?: string }> {
    try {
        const tokenParts = accessToken.split('!');

        if (tokenParts.length !== 3) {
            return {
                success: false,
                message: 'Ongeldig token formaat. Verwacht formaat: access_token!expires_at!refresh_token'
            };
        }

        const [actualAccessToken, expiresAt, refreshToken] = tokenParts;

        const expiresAtNumber = parseInt(expiresAt, 10);
        if (isNaN(expiresAtNumber)) {
            return {
                success: false,
                message: 'Ongeldige vervaldatum in token'
            };
        }
        const response = await fetch('https://api.somtoday.nl/rest/v1/leerlingen', {
            headers: {
                Authorization: `Bearer ${actualAccessToken}`,
                Accept: 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                return {
                    success: false,
                    message: 'Ongeldige access token'
                };
            }
            return {
                success: false,
                message: `Fout bij het verifiëren van de access token: ${response.statusText}`
            };
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                somtodayToken: actualAccessToken,
                somtodayRefreshToken: refreshToken,
                somtodayTokenExpires: expiresAtNumber,
                somtodayTokenUpdatedAt: new Date(),
            },
        });

        return {
            success: true,
            message: 'Succesvol verbonden met Somtoday'
        };
    } catch (error) {
        console.error('Error connecting with access token:', error);
        return {
            success: false,
            message: error instanceof Error
                ? error.message
                : 'Er is een fout opgetreden bij het verbinden met Somtoday'
        };
    }

}

export async function getExams(authToken: string) {
    const startDate = new Date();
    const day = startDate.getDay();
    if (day === 6) {
        startDate.setDate(startDate.getDate() + 2);
    } else if (day === 0) {
        startDate.setDate(startDate.getDate() + 1);
    }

    const formattedDate = startDate.toISOString().split('T')[0];

    const url = `https://api.somtoday.nl/rest/v1/studiewijzeritemafspraaktoekenningen?begintNaOfOp=${formattedDate}`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json'
        }
    });

    if (response.status === 401) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();




    const exams = data.items
        .filter((item: any) =>
            item.studiewijzerItem?.huiswerkType?.toLowerCase()?.includes('toets')
        )
        .map((item: any) => ({
            onderwerp: item.studiewijzerItem.onderwerp,
            omschrijving: item.studiewijzerItem.omschrijving
                .replace(/\\u003C/g, '<')
                .replace(/\\u003E/g, '>')
                .replace(/&#39;/g, "'")
                .replace(/<p[^>]*>/g, '')
                .replace(/<\/p>/g, '\n')
                .replace(/<li[^>]*>/g, '- ')
                .replace(/<\/li>/g, '\n')
                .replace(/<ul[^>]*>/g, '')
                .replace(/<\/ul>/g, '\n')
                .replace(/<[^>]+>/g, '')
                .replace(/\n\s*\n/g, '\n')
                .trim(),
            vak: item.lesgroep.vak.naam
                .toLowerCase()
                .split(' ')
                .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' '),
            datum: item.datumTijd,
            lesgroep: item.lesgroep.naam
        }));

    return exams;
}

export async function refreshSomtodayToken(
    userId: number
): Promise<{ success: boolean; message?: string }> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                somtodayRefreshToken: true,
                somtodayTokenUpdatedAt: true
            }
        });

        if (!user || !user.somtodayRefreshToken) {
            return {
                success: false,
                message: 'Geen refresh token gevonden. Verbind opnieuw met Somtoday.'
            };
        }

        const response = await fetch('https://somtoday.nl/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: user.somtodayRefreshToken,
                client_id: 'somtoday-leerling-web',
                scope: 'openid'
            })
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 400) {
                return {
                    success: false,
                    message: 'Refresh token is verlopen. Verbind opnieuw met Somtoday.'
                };
            }
            return {
                success: false,
                message: `Fout bij het vernieuwen van de token: ${response.statusText}`
            };
        }

        const data = await response.json();

        await prisma.user.update({
            where: { id: userId },
            data: {
                somtodayToken: data.access_token,
                somtodayRefreshToken: data.refresh_token,
                somtodayTokenUpdatedAt: new Date(),
            },
        });

        return {
            success: true,
            message: 'Token succesvol vernieuwd'
        };

    } catch (error) {
        console.error('Error refreshing Somtoday token:', error);
        return {
            success: false,
            message: error instanceof Error
                ? error.message
                : 'Er is een fout opgetreden bij het vernieuwen van de token'
        };
    }
}
function getMonthDay(date: Date) {
    return { month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

export async function getExam(vak: string, datum: string, authToken: string) {
    const exams = await getAllExams(authToken);

    if (exams === 'Je hebt somtoday niet gekoppeld of token is verlopen') {
        return ('Je hebt somtoday niet gekoppeld of token is verlopen');
    }

    const normalizedVak = vak.trim().toLowerCase();
    const targetDate = new Date(datum);
    const { month: targetMonth, day: targetDay } = getMonthDay(targetDate);

    const matchingExam = exams.find((exam: any) => {
        const examDate = new Date(exam.datum);
        const { month, day } = getMonthDay(examDate);
        const examVak = (exam.vak || '').trim().toLowerCase();
        return examVak === normalizedVak && month === targetMonth && day === targetDay;
    });

    if (!matchingExam) return null;

    const allExams = await prisma.exam.findMany({
        where: { vak: vak },
        select: {
            dateDue: true,
            notes: true,
            links: true,
            books: true
        }
    });

    const examRecord = allExams.find((e) => {
        const { month, day } = getMonthDay(new Date(e.dateDue));
        return month === targetMonth && day === targetDay;
    });

    const image_url = await getVakBoekImage(vak);

    const examDate = new Date(matchingExam.datum);
    const formattedDate = examDate.toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long'
    });

    return {
        ...matchingExam,
        image_url,
        formattedDate,
        notes: examRecord?.notes || '',
        links: (examRecord?.links as string[]) || [],
        books: (examRecord?.books as string[]) || [],
    };
}

export async function getAllExams(authToken: string) {
    const startDate = new Date();
    const day = startDate.getDay();
    if (day === 6) {
        startDate.setDate(startDate.getDate() + 2);
    } else if (day === 0) {
        startDate.setDate(startDate.getDate() + 1);
    }

    const formattedDate = startDate.toISOString().split('T')[0];

    const url = `https://api.somtoday.nl/rest/v1/studiewijzeritemafspraaktoekenningen`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json'
        }
    });

    if (response.status === 401) {
        throw new Error('Somtoday token niet meer geldig')
    }

    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    const exams = data.items
        .filter((item: any) =>
            item.studiewijzerItem?.huiswerkType?.toLowerCase()?.includes('toets')
        )
        .map((item: any) => ({
            onderwerp: item.studiewijzerItem.onderwerp,
            omschrijving: item.studiewijzerItem.omschrijving
                .replace(/\\u003C/g, '<')
                .replace(/\\u003E/g, '>')
                .replace(/&#39;/g, "'")
                .replace(/<p[^>]*>/g, '')
                .replace(/<\/p>/g, '\n')
                .replace(/<li[^>]*>/g, '- ')
                .replace(/<\/li>/g, '\n')
                .replace(/<ul[^>]*>/g, '')
                .replace(/<\/ul>/g, '\n')
                .replace(/<[^>]+>/g, '')
                .replace(/\n\s*\n/g, '\n')
                .trim(),
            vak: item.lesgroep.vak.naam
                .toLowerCase()
                .split(' ')
                .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' '),
            datum: item.datumTijd,
            lesgroep: item.lesgroep.naam
        }));

    return exams;
}

export async function setProfilePicture(userId: number) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { somtodayToken: true, profilePicture: true }
    });

    if (!user) {
        throw new Error('User not found');
    }
    if (user.somtodayToken && !user.profilePicture) {
        const response = await fetch('https://api.somtoday.nl/rest/v1/leerlingen', {
            headers: {
                Authorization: `Bearer ${user.somtodayToken}`,
                Accept: 'application/json'
            }
        });
        const data = await response.json()
        const profilePicture = data?.items?.[0]?.pasfotoUrl

        if (!profilePicture) throw new Error('No pasfotoUrl found in response');

        await prisma.user.update({
            where: { id: userId },
            data: { profilePicture }
        });
    }
}
export async function getStudent(authToken: string) {
    const response = await fetch('https://api.somtoday.nl/rest/v1/leerlingen', {
        headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }
    const data = await response.json()

    return data
}
export async function getGrades(authToken: string) {
    try {
        const student = await getStudent(authToken);
        if (!student.items || student.items.length === 0) {
            throw new Error('No students found for this token.');
        }

        const id = student.items[0].links[0].id.toString();

        const response = await fetch(`https://api.somtoday.nl/rest/v1/resultaten/huidigVoorLeerling/${id}`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
                Accept: 'application/json',
            },
        });

        if (response.status === 401) {
            return null;
        }

        if (!response.ok) {
            console.error("Somtoday API error:", response.status);
            return null;
        }

        const data = await response.json();

        const grades = data.items
            .filter((item: any) => item.type === 'Toetskolom')
            .map((item: any) => {
                const cijfer = parseFloat(String(item.resultaat).replace(',', '.'));
                return {
                    vak: item.vak?.naam
                        ? item.vak.naam
                            .toLowerCase()
                            .split(' ')
                            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')
                        : 'Unknown',
                    grade: item.resultaat,
                    weging: item.weging ?? 0,
                    omschrijving: item.omschrijving || '',
                    datum: new Date(item.datumInvoer).toLocaleDateString('nl-NL', {
                        day: 'numeric',
                        month: 'short'
                    }),
                    icon: getIcon(item.vak?.naam ?? ''),
                    type:
                        cijfer < 5.5
                            ? 'onvoldoende'
                            : cijfer >= 7
                                ? 'goed'
                                : 'voldoende'
                };
            });

        return grades;
    } catch (err: any) {
        console.error("getGrades error:", err.message || err);
        return null;
    }
}

export async function getAllHomework(authToken: string) {
    const url = `https://api.somtoday.nl/rest/v1/studiewijzeritemafspraaktoekenningen`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json'
        }
    });

    if (response.status === 401) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    const homework = await Promise.all(
        data.items
            .filter((item: any) =>
                item.studiewijzerItem?.huiswerkType?.toLowerCase()?.includes('huiswerk')
            )
            .map(async (item: any) => {
                const vak = item.lesgroep.vak.naam
                    .toLowerCase()
                    .split(' ')
                    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                const imageUrl = await getVakBoekImage(vak);

                const homeworkLink = `/homework/${vak
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '')}-${item.datumTijd ? new Date(item.datumTijd).toISOString().split('T')[0] : 'no-date'}`;

                return {
                    onderwerp: item.studiewijzerItem.onderwerp,
                    omschrijving: item.studiewijzerItem.omschrijving
                        .replace(/\\u003C/g, '<')
                        .replace(/\\u003E/g, '>')
                        .replace(/&#39;/g, "'")
                        .replace(/<p[^>]*>/g, '')
                        .replace(/<\/p>/g, '\n')
                        .replace(/<li[^>]*>/g, '- ')
                        .replace(/<\/li>/g, '\n')
                        .replace(/<ul[^>]*>/g, '')
                        .replace(/<\/ul>/g, '\n')
                        .replace(/<[^>]+>/g, '')
                        .replace(/\n\s*\n/g, '\n')
                        .trim(),
                    vak,
                    datum: item.datumTijd ? new Date(item.datumTijd).toLocaleDateString('nl-NL', {
                        day: 'numeric',
                        month: 'long'
                    }) : null,
                    oldDatum: item.datumTijd,
                    lesgroep: item.lesgroep.naam,
                    imageUrl,
                    link: homeworkLink,
                    bijlagen: (item.studiewijzerItem?.bijlagen || []).flatMap((bijlage: any) =>
                        (bijlage.assemblyResults || []).map((result: any) => ({
                            name: result.fileName || bijlage.omschrijving || 'unknown',
                            url: result.fileUrl || result.sslUrl,
                        }))
                    )
                };
            })
    );

    homework.sort((a, b) => {
        const dateA = a.oldDatum ? new Date(a.oldDatum).getTime() : 0;
        const dateB = b.oldDatum ? new Date(b.oldDatum).getTime() : 0;
        return dateA - dateB;
    });

    return homework;
}
export async function getHomeworkItem(vak: string, datum: string, authToken: string) {
    const homework = await getAllHomework(authToken);

    if (!homework) return null;

    const normalizedVak = vak.trim().toLowerCase();
    const targetDate = new Date(datum);
    const { month: targetMonth, day: targetDay } = getMonthDay(targetDate);

    const matchingHomework = homework.find((homeworkItem: any) => {
        const homeworkDate = new Date(homeworkItem.oldDatum);
        const { month, day } = getMonthDay(homeworkDate);
        const homeworkVak = (homeworkItem.vak || '').trim().toLowerCase();
        return homeworkVak === normalizedVak && month === targetMonth && day === targetDay;
    });

    if (!matchingHomework) return null;

    const allHomework = await prisma.homework.findMany({
        where: { vak: vak },
        select: {
            dateDue: true,
            notes: true,
            links: true,
        },
    });

    const homeworkRecord = allHomework.find((h) => {
        const { month, day } = getMonthDay(new Date(h.dateDue));
        return month === targetMonth && day === targetDay;
    });

    const image_url = await getVakBoekImage(vak);

    const homeworkDate = new Date(matchingHomework.oldDatum);
    const formattedDate = homeworkDate.toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long',
    });

    const bijlagen = matchingHomework.bijlagen || [];


    return {
        ...matchingHomework,
        image_url,
        formattedDate,
        notes: homeworkRecord?.notes || '',
        links: (homeworkRecord?.links as string[]) || [],
        bijlagen,
    };
}
export async function getHomework(authToken: string) {
    const startDate = new Date();
    const day = startDate.getDay();
    if (day === 6) {
        startDate.setDate(startDate.getDate() + 2);
    } else if (day === 0) {
        startDate.setDate(startDate.getDate() + 1);
    }

    const formattedDate = startDate.toISOString().split('T')[0];

    const url = `https://api.somtoday.nl/rest/v1/studiewijzeritemafspraaktoekenningen?begintNaOfOp=${formattedDate}`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json'
        }
    });

    if (response.status === 401) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    const homework = await Promise.all(
        data.items
            .filter((item: any) =>
                item.studiewijzerItem?.huiswerkType?.toLowerCase()?.includes('huiswerk')
            )
            .map(async (item: any) => {
                const vak = item.lesgroep.vak.naam
                    .toLowerCase()
                    .split(' ')
                    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                const imageUrl = await getVakBoekImage(vak);

                const homeworkLink = `/homework/${vak
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '')}-${item.datumTijd ? new Date(item.datumTijd).toISOString().split('T')[0] : 'no-date'}`;

                return {
                    onderwerp: item.studiewijzerItem.onderwerp,
                    omschrijving: item.studiewijzerItem.omschrijving
                        .replace(/\\u003C/g, '<')
                        .replace(/\\u003E/g, '>')
                        .replace(/&#39;/g, "'")
                        .replace(/<p[^>]*>/g, '')
                        .replace(/<\/p>/g, '\n')
                        .replace(/<li[^>]*>/g, '- ')
                        .replace(/<\/li>/g, '\n')
                        .replace(/<ul[^>]*>/g, '')
                        .replace(/<\/ul>/g, '\n')
                        .replace(/<[^>]+>/g, '')
                        .replace(/\n\s*\n/g, '\n')
                        .trim(),
                    vak,
                    datum: item.datumTijd ? new Date(item.datumTijd).toLocaleDateString('nl-NL', {
                        day: 'numeric',
                        month: 'long'
                    }) : null,
                    OldDatum: item.datumTijd,
                    lesgroep: item.lesgroep.naam,
                    imageUrl,
                    link: homeworkLink
                };
            })
    );

    homework.sort((a, b) => {
        const dateA = a.OldDatum ? new Date(a.OldDatum).getTime() : 0;
        const dateB = b.OldDatum ? new Date(b.OldDatum).getTime() : 0;
        return dateA - dateB;
    });

    return homework;
}
