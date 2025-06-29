import { SVGProps } from "react";
import {
  User,
  Class,
  Participant,
  Event,
  Assignment,
  Present,
  UserRole,
  ParticipantStatus,
  PresentStatus,
} from "@prisma/client";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Extended types with relations
export type UserWithParticipant = User & {
  participant?: ParticipantWithRelations | null;
};

export type ParticipantWithRelations = Participant & {
  user: User;
  class?: Class | null;
  event: Event;
  givingAssignment?: Assignment | null;
  receivingAssignment?: Assignment | null;
  presentGiven?: Present | null;
  presentReceived?: Present | null;
};

export type EventWithParticipants = Event & {
  participants: ParticipantWithRelations[];
  assignments: Assignment[];
};

export type AssignmentWithDetails = Assignment & {
  giver: ParticipantWithRelations;
  receiver: ParticipantWithRelations;
};

// Dashboard statistics types
export interface EventStats {
  totalParticipants: number;
  registeredCount: number;
  assignedCount: number;
  submittedPresentsCount: number;
  deliveredPresentsCount: number;
  participantsByClass: Array<{
    className: string;
    count: number;
  }>;
  registrationsByDate: Array<{
    date: string;
    count: number;
  }>;
}

// Form types
export interface RegistrationForm {
  classId: string;
  interests: string;
}

export interface CreateEventForm {
  name: string;
  description: string;
  registrationDeadline: Date;
  assignmentDate: Date;
  giftDeadline: Date;
  deliveryDate: Date;
}

export interface CreateClassForm {
  name: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  total: number;
  page: number;
  limit: number;
}

// Export Prisma enums for easy access
export { UserRole, ParticipantStatus, PresentStatus };
