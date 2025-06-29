"use client";
import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Pagination,
  Chip,
  Avatar,
} from "@heroui/react";
import useSWR from "swr";
import { Participant, PresentStatus, User } from "@prisma/client";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Define the participant type with nested relations
type ParticipantWithDetails = Participant & {
  user: User;
  class?: { id: string; name: string } | null;
  givingAssignment?: {
    receiver: Participant & {
      user: User;
      class?: { id: string; name: string } | null;
    };
  } | null;
  presentGiven?: {
    status: PresentStatus;
    description?: string | null;
    submittedAt?: Date | null;
  } | null;
};

export default function ParticipantsTable() {
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 10;

  const { data, isLoading } = useSWR(
    `/api/participants?page=${page}&limit=${rowsPerPage}`,
    fetcher,
    { keepPreviousData: true },
  );

  const pages = React.useMemo(() => {
    return data?.total ? Math.ceil(data.total / rowsPerPage) : 0;
  }, [data?.total]);

  const loadingState = isLoading || !data?.results?.length ? "loading" : "idle";

  const renderAssignmentInfo = (participant: ParticipantWithDetails) => {
    if (!participant.givingAssignment) {
      return (
        <Chip color="default" size="sm" variant="flat">
          Nicht zugeordnet
        </Chip>
      );
    }

    const receiver = participant.givingAssignment.receiver;

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Avatar
            name={`${receiver.user.firstName} ${receiver.user.lastName}`}
            size="sm"
            src={receiver.user.imageUrl || undefined}
          />
          <div>
            <p className="text-sm font-medium">
              {receiver.user.firstName} {receiver.user.lastName}
            </p>
            {receiver.class && (
              <p className="text-xs text-default-500">{receiver.class.name}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPresentStatus = (participant: ParticipantWithDetails) => {
    if (!participant.presentGiven) {
      return (
        <Chip color="default" size="sm" variant="flat">
          Kein Geschenk
        </Chip>
      );
    }

    const present = participant.presentGiven;
    const statusColors: Record<
      PresentStatus,
      "default" | "warning" | "success"
    > = {
      NOT_SUBMITTED: "default",
      SUBMITTED: "warning",
      DELIVERED: "success",
    };

    const statusLabels: Record<PresentStatus, string> = {
      NOT_SUBMITTED: "Nicht abgegeben",
      SUBMITTED: "Abgegeben",
      DELIVERED: "Übergeben",
    };

    return (
      <div className="flex flex-col gap-1">
        <Chip color={statusColors[present.status]} size="sm" variant="flat">
          {statusLabels[present.status]}
        </Chip>
        {present.description && (
          <p className="text-xs text-default-500 max-w-32 truncate">
            {present.description}
          </p>
        )}
        {present.submittedAt && (
          <p className="text-xs text-default-400">
            {new Date(present.submittedAt).toLocaleDateString("de-DE")}
          </p>
        )}
      </div>
    );
  };

  return (
    <Table
      aria-label="Teilnehmertabelle mit Zuordnungen und Geschenken"
      bottomContent={
        pages > 1 && (
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={pages}
              onChange={setPage}
            />
          </div>
        )
      }
      classNames={{
        table: "min-h-[400px]",
      }}
    >
      <TableHeader>
        <TableColumn key="participant">Teilnehmer</TableColumn>
        <TableColumn key="class">Klasse</TableColumn>
        <TableColumn key="assignment">Zuordnung (Beschenkt)</TableColumn>
        <TableColumn key="present">Geschenk-Status</TableColumn>
        <TableColumn key="status">Status</TableColumn>
      </TableHeader>
      <TableBody
        emptyContent={"Keine Teilnehmer gefunden."}
        isLoading={isLoading}
        items={data?.results ?? []}
        loadingContent={<Spinner label="Lade Daten..." />}
        loadingState={loadingState}
      >
        {(participant: ParticipantWithDetails) => (
          <TableRow key={participant.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar
                  name={`${participant.user.firstName} ${participant.user.lastName}`}
                  size="md"
                  src={participant.user.imageUrl || undefined}
                />
                <div>
                  <p className="font-medium">
                    {participant.user.firstName} {participant.user.lastName}
                  </p>
                  <p className="text-sm text-default-500">
                    {participant.user.email}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              {participant.class ? (
                <Chip color="primary" size="sm" variant="flat">
                  {participant.class.name}
                </Chip>
              ) : (
                <span className="text-default-400">Keine Klasse</span>
              )}
            </TableCell>
            <TableCell>{renderAssignmentInfo(participant)}</TableCell>
            <TableCell>{renderPresentStatus(participant)}</TableCell>
            <TableCell>
              <Chip
                color={
                  participant.status === "GIFT_DELIVERED"
                    ? "success"
                    : participant.status === "GIFT_SUBMITTED"
                      ? "warning"
                      : participant.status === "ASSIGNED"
                        ? "primary"
                        : "default"
                }
                size="sm"
                variant="flat"
              >
                {participant.status === "GIFT_DELIVERED"
                  ? "Geschenk übergeben"
                  : participant.status === "GIFT_SUBMITTED"
                    ? "Geschenk abgegeben"
                    : participant.status === "ASSIGNED"
                      ? "Zugeordnet"
                      : "Registriert"}
              </Chip>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
