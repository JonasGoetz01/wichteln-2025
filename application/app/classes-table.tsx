"use client";
import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Spinner,
  Pagination,
} from "@heroui/react";
import useSWR from "swr";
import { Class, User } from "@prisma/client";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ClassesTable() {
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 10;

  const { data, isLoading } = useSWR(
    `/api/classes?page=${page}&limit=${rowsPerPage}`,
    fetcher,
    { keepPreviousData: true }
  );

  const pages = React.useMemo(() => {
    return data?.total ? Math.ceil(data.total / rowsPerPage) : 0;
  }, [data?.total]);

  const loadingState = isLoading || !data?.results?.length ? "loading" : "idle";

  return (
    <Table
      aria-label="Klassen mit Pagination"
      classNames={{
        table: "min-h-[400px]",
      }}
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
    >
      <TableHeader>
        <TableColumn key="id">ID</TableColumn>
        <TableColumn key="name">Name</TableColumn>
        <TableColumn key="createdAt">Erstellt am</TableColumn>
        <TableColumn key="updatedAt">Aktualisiert am</TableColumn>
      </TableHeader>
      <TableBody
        emptyContent={"Keine Klassen gefunden."}
        isLoading={isLoading}
        items={data?.results ?? []}
        loadingContent={<Spinner label="Lade Daten..." />}
        loadingState={loadingState}
      >
        {(item: Class) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell>{getKeyValue(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}