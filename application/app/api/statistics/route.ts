import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from '@clerk/nextjs/server';
import { getCurrentUser } from "@/lib/auth";
import { isUserAdmin } from "@/lib/event-utils";
import { format, subDays, eachDayOfInterval } from 'date-fns';

export async function GET(req: Request) {
  await auth.protect();
  
  const user = await getCurrentUser();
  if (!user || !(await isUserAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all participants with their classes and users
    const participants = await db.participant.findMany({
      include: {
        user: true,
        class: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Get all classes with participant counts
    const classes = await db.class.findMany({
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    // Calculate basic statistics
    const totalParticipants = participants.length;
    const totalClasses = classes.length;
    const totalUsers = await db.user.count();

    // Registrations by class
    const participantsByClass = classes.map(cls => ({
      className: cls.name,
      count: cls.participants.length,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`, // Random color for charts
    }));

    // Registrations over time (last 30 days)
    const thirtyDaysAgo = subDays(new Date(), 30);
    const dateRange = eachDayOfInterval({
      start: thirtyDaysAgo,
      end: new Date(),
    });

    const registrationsByDate = dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = participants.filter(p => {
        const createdDate = format(p.createdAt, 'yyyy-MM-dd');
        return createdDate === dateStr;
      }).length;

      return {
        date: dateStr,
        dateFormatted: format(date, 'MMM dd'),
        count,
        cumulative: 0, // Will be calculated below
      };
    });

    // Calculate cumulative registrations
    let cumulative = 0;
    registrationsByDate.forEach(day => {
      cumulative += day.count;
      day.cumulative = cumulative;
    });

    // Recent activity (last 10 registrations)
    const recentActivity = participants
      .slice(-10)
      .reverse()
      .map(p => ({
        id: p.id,
        userName: `${p.user.firstName || 'User'} ${p.user.lastName || ''}`.trim(),
        userEmail: p.user.email,
        className: p.class?.name || 'No Class',
        registeredAt: p.createdAt,
      }));

    // Class distribution for pie chart
    const classDistribution = participantsByClass.filter(cls => cls.count > 0);

    // Summary statistics
    const stats = {
      totalParticipants,
      totalClasses,
      totalUsers,
      registeredCount: totalParticipants,
      pendingAssignments: totalParticipants, // Will be updated when assignments are implemented
      submittedPresents: 0, // Placeholder
      deliveredPresents: 0, // Placeholder
      averageParticipantsPerClass: totalClasses > 0 ? Math.round(totalParticipants / totalClasses) : 0,
    };

    // Growth metrics
    const lastWeekRegistrations = participants.filter(p => 
      p.createdAt >= subDays(new Date(), 7)
    ).length;

    const previousWeekRegistrations = participants.filter(p => 
      p.createdAt >= subDays(new Date(), 14) && 
      p.createdAt < subDays(new Date(), 7)
    ).length;

    const growthRate = previousWeekRegistrations > 0 
      ? ((lastWeekRegistrations - previousWeekRegistrations) / previousWeekRegistrations) * 100
      : lastWeekRegistrations > 0 ? 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        stats,
        participantsByClass,
        registrationsByDate,
        classDistribution,
        recentActivity,
        growthMetrics: {
          lastWeekRegistrations,
          previousWeekRegistrations,
          growthRate: Math.round(growthRate * 100) / 100,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json({ 
      error: error.message || "Failed to fetch statistics" 
    }, { status: 500 });
  }
} 