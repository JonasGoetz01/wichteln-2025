"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Progress,
  Tabs,
  Tab,
} from "@heroui/react";
import useSWR from "swr";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { format } from "date-fns";

import EventManager from "./event-manager";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface AdminDashboardProps {
  className?: string;
}

export default function AdminDashboard({ className }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [loading, setLoading] = useState(false);

  // Fetch statistics
  const {
    data: statsData,
    error: statsError,
    mutate: mutateStats,
  } = useSWR(
    "/api/statistics",
    fetcher,
    { refreshInterval: 30000 }, // Refresh every 30 seconds
  );

  // Fetch presents data
  const { data: presentsData, mutate: mutatePresents } = useSWR(
    "/api/presents",
    fetcher,
  );

  // Add assignments data fetching
  const { data: assignmentsData, mutate: mutateAssignments } = useSWR(
    "/api/assignments",
    fetcher,
  );

  const stats = statsData?.data?.stats || {};
  const chartData = statsData?.data || {};

  const handleCreateAssignments = async () => {
    if (
      !confirm(
        "Are you sure you want to create assignments? This action cannot be undone.",
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        await mutateStats();
        await mutateAssignments(); // Refresh assignments data
        alert("Assignments created successfully!");
      } else {
        const error = await response.json();

        alert(error.error || "Failed to create assignments");
      }
    } catch (error) {
      console.error("Error creating assignments:", error);
      alert("Failed to create assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPresent = async (action: string, participantId: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/presents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, participantId }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        mutatePresents();
        mutateStats();
      } else {
        alert(result.error || "Failed to update present");
      }
    } catch (error) {
      console.error("Error updating present:", error);
      alert("Failed to update present");
    } finally {
      setLoading(false);
    }
  };

  if (statsError) {
    return (
      <Card className={className}>
        <CardBody className="text-center py-8">
          <p className="text-red-500">Error loading dashboard data</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-default-500">Manage the gift exchange event</p>
            </div>
            <Button
              color="primary"
              disabled={loading}
              isLoading={loading}
              onPress={handleCreateAssignments}
            >
              Create Assignments
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalParticipants || 0}
            </div>
            <div className="text-sm text-default-500">Total Participants</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.totalClasses || 0}
            </div>
            <div className="text-sm text-default-500">Classes</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.submittedPresents || 0}
            </div>
            <div className="text-sm text-default-500">Presents Submitted</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.deliveredPresents || 0}
            </div>
            <div className="text-sm text-default-500">Presents Delivered</div>
          </CardBody>
        </Card>
      </div>

      {/* Tabs for detailed views */}
      <Card>
        <CardBody>
          <Tabs
            aria-label="Dashboard tabs"
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
          >
            <Tab key="overview" title="Overview">
              <div className="space-y-6 mt-4">
                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Registrations over time */}
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">
                        Registrations Over Time
                      </h3>
                    </CardHeader>
                    <CardBody>
                      <ResponsiveContainer height={300} width="100%">
                        <LineChart data={chartData.registrationsByDate || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="dateFormatted" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            dataKey="cumulative"
                            stroke="#8884d8"
                            strokeWidth={2}
                            type="monotone"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardBody>
                  </Card>

                  {/* Class distribution */}
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">
                        Participants by Class
                      </h3>
                    </CardHeader>
                    <CardBody>
                      <ResponsiveContainer height={300} width="100%">
                        <BarChart data={chartData.participantsByClass || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="className" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardBody>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">
                      Recent Registrations
                    </h3>
                  </CardHeader>
                  <CardBody>
                    <Table aria-label="Recent registrations">
                      <TableHeader>
                        <TableColumn>Name</TableColumn>
                        <TableColumn>Class</TableColumn>
                        <TableColumn>Registered</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {(chartData.recentActivity || []).map(
                          (activity: any) => (
                            <TableRow key={activity.id}>
                              <TableCell>{activity.userName}</TableCell>
                              <TableCell>
                                <Chip size="sm" variant="flat">
                                  {activity.className}
                                </Chip>
                              </TableCell>
                              <TableCell>
                                {format(
                                  new Date(activity.registeredAt),
                                  "MMM dd, HH:mm",
                                )}
                              </TableCell>
                            </TableRow>
                          ),
                        )}
                      </TableBody>
                    </Table>
                  </CardBody>
                </Card>
              </div>
            </Tab>

            <Tab key="events" title="Event Management">
              <div className="mt-4">
                <EventManager />
              </div>
            </Tab>

            <Tab key="participants" title="Participants">
              <div className="mt-4">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">
                      Participant Management
                    </h3>
                  </CardHeader>
                  <CardBody>
                    <Table aria-label="Participants">
                      <TableHeader>
                        <TableColumn>Name</TableColumn>
                        <TableColumn>Email</TableColumn>
                        <TableColumn>Class</TableColumn>
                        <TableColumn>Status</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {(assignmentsData?.assignments || []).map(
                          (assignment: any) => (
                            <TableRow key={assignment.giver.id}>
                              <TableCell>
                                {assignment.giver.user.firstName}{" "}
                                {assignment.giver.user.lastName}
                              </TableCell>
                              <TableCell>
                                {assignment.giver.user.email}
                              </TableCell>
                              <TableCell>
                                <Chip size="sm" variant="flat">
                                  {assignment.giver.class?.name || "No Class"}
                                </Chip>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  color={
                                    assignment.giver.status === "GIFT_DELIVERED"
                                      ? "success"
                                      : assignment.giver.status ===
                                          "GIFT_SUBMITTED"
                                        ? "warning"
                                        : assignment.giver.status === "ASSIGNED"
                                          ? "primary"
                                          : "default"
                                  }
                                  size="sm"
                                  variant="flat"
                                >
                                  {assignment.giver.status === "GIFT_DELIVERED"
                                    ? "Gift Delivered"
                                    : assignment.giver.status ===
                                        "GIFT_SUBMITTED"
                                      ? "Gift Submitted"
                                      : assignment.giver.status === "ASSIGNED"
                                        ? "Assigned"
                                        : "Registered"}
                                </Chip>
                              </TableCell>
                            </TableRow>
                          ),
                        )}
                      </TableBody>
                    </Table>
                  </CardBody>
                </Card>
              </div>
            </Tab>

            <Tab key="presents" title="Present Tracking">
              <div className="mt-4">
                <Card>
                  <CardHeader className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Present Tracking
                      </h3>
                      <p className="text-sm text-default-500">
                        Track gift submission and delivery status
                      </p>
                    </div>
                    {presentsData?.stats && (
                      <div className="flex gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-orange-600">
                            {presentsData.stats.submittedCount || 0}
                          </div>
                          <div className="text-default-500">Submitted</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">
                            {presentsData.stats.deliveredCount || 0}
                          </div>
                          <div className="text-default-500">Delivered</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-default-600">
                            {presentsData.stats.pendingCount || 0}
                          </div>
                          <div className="text-default-500">Pending</div>
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardBody>
                    {!presentsData?.presents ||
                    presentsData.presents.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-default-500 mb-4">
                          {!presentsData?.event
                            ? "No active event found."
                            : "No presents found. Create assignments first to start tracking presents."}
                        </p>
                        {!assignmentsData?.assignments ||
                        assignmentsData.assignments.length === 0 ? (
                          <Button
                            color="primary"
                            isLoading={loading}
                            onPress={handleCreateAssignments}
                          >
                            Create Assignments
                          </Button>
                        ) : null}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Progress Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="p-4 bg-orange-50 rounded-lg">
                            <h4 className="font-semibold text-orange-800 mb-2">
                              Submission Progress
                            </h4>
                            <Progress
                              className="mb-2"
                              color="warning"
                              showValueLabel={true}
                              value={
                                presentsData.stats.totalParticipants > 0
                                  ? (presentsData.stats.submittedCount /
                                      presentsData.stats.totalParticipants) *
                                    100
                                  : 0
                              }
                            />
                            <p className="text-sm text-orange-700">
                              {presentsData.stats.submittedCount} of{" "}
                              {presentsData.stats.totalParticipants} submitted
                            </p>
                          </div>
                          <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="font-semibold text-green-800 mb-2">
                              Delivery Progress
                            </h4>
                            <Progress
                              className="mb-2"
                              color="success"
                              showValueLabel={true}
                              value={
                                presentsData.stats.totalParticipants > 0
                                  ? (presentsData.stats.deliveredCount /
                                      presentsData.stats.totalParticipants) *
                                    100
                                  : 0
                              }
                            />
                            <p className="text-sm text-green-700">
                              {presentsData.stats.deliveredCount} of{" "}
                              {presentsData.stats.totalParticipants} delivered
                            </p>
                          </div>
                        </div>

                        {/* Present Tracking Table */}
                        <Table aria-label="Present tracking">
                          <TableHeader>
                            <TableColumn>Giver</TableColumn>
                            <TableColumn>Class</TableColumn>
                            <TableColumn>→</TableColumn>
                            <TableColumn>Receiver</TableColumn>
                            <TableColumn>Class</TableColumn>
                            <TableColumn>Status</TableColumn>
                            <TableColumn>Description</TableColumn>
                            <TableColumn>Actions</TableColumn>
                          </TableHeader>
                          <TableBody>
                            {presentsData.presents.map((present: any) => (
                              <TableRow key={present.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">
                                      {present.giver.user.firstName}{" "}
                                      {present.giver.user.lastName}
                                    </p>
                                    <p className="text-xs text-default-500">
                                      {present.giver.user.email}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    color="primary"
                                    size="sm"
                                    variant="flat"
                                  >
                                    {present.giver.class?.name || "No Class"}
                                  </Chip>
                                </TableCell>
                                <TableCell>
                                  <span className="text-2xl text-default-400">
                                    →
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">
                                      {present.receiver.user.firstName}{" "}
                                      {present.receiver.user.lastName}
                                    </p>
                                    <p className="text-xs text-default-500">
                                      {present.receiver.user.email}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    color="secondary"
                                    size="sm"
                                    variant="flat"
                                  >
                                    {present.receiver.class?.name || "No Class"}
                                  </Chip>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    color={
                                      present.status === "DELIVERED"
                                        ? "success"
                                        : present.status === "SUBMITTED"
                                          ? "warning"
                                          : "default"
                                    }
                                    size="sm"
                                    variant="flat"
                                  >
                                    {present.status === "DELIVERED"
                                      ? "Delivered"
                                      : present.status === "SUBMITTED"
                                        ? "Submitted"
                                        : "Pending"}
                                  </Chip>
                                </TableCell>
                                <TableCell>
                                  <p className="text-xs text-default-500 max-w-32 truncate">
                                    {present.description || "No description"}
                                  </p>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    {present.status === "NOT_SUBMITTED" && (
                                      <Button
                                        color="warning"
                                        isLoading={loading}
                                        size="sm"
                                        variant="flat"
                                        onPress={() =>
                                          handleMarkPresent(
                                            "mark_submitted",
                                            present.giver.id,
                                          )
                                        }
                                      >
                                        Mark Submitted
                                      </Button>
                                    )}
                                    {present.status === "SUBMITTED" && (
                                      <Button
                                        color="success"
                                        isLoading={loading}
                                        size="sm"
                                        variant="flat"
                                        onPress={() =>
                                          handleMarkPresent(
                                            "mark_delivered",
                                            present.giver.id,
                                          )
                                        }
                                      >
                                        Mark Delivered
                                      </Button>
                                    )}
                                    {present.status === "DELIVERED" && (
                                      <Chip
                                        color="success"
                                        size="sm"
                                        variant="flat"
                                      >
                                        ✓ Complete
                                      </Chip>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>
            </Tab>

            <Tab key="assignments" title="Assignments">
              <div className="mt-4">
                <Card>
                  <CardHeader className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">
                      Assignment Overview
                    </h3>
                    {assignmentsData?.assignments &&
                      assignmentsData.assignments.length === 0 && (
                        <Button
                          color="primary"
                          isLoading={loading}
                          onPress={handleCreateAssignments}
                        >
                          Create Assignments
                        </Button>
                      )}
                  </CardHeader>
                  <CardBody>
                    {!assignmentsData?.event ? (
                      <div className="text-center py-8">
                        <p className="text-default-500 mb-4">
                          No active event found. Please create and activate an
                          event first.
                        </p>
                      </div>
                    ) : assignmentsData.assignments &&
                      assignmentsData.assignments.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm text-default-600">
                              <strong>Event:</strong>{" "}
                              {assignmentsData.event.name}
                            </p>
                            <p className="text-sm text-default-500">
                              {assignmentsData.assignments.length} assignments
                              created
                            </p>
                          </div>
                          <Chip color="success" variant="flat">
                            Assignments Active
                          </Chip>
                        </div>

                        <Table aria-label="Secret Santa Assignments">
                          <TableHeader>
                            <TableColumn>Giver</TableColumn>
                            <TableColumn>Class</TableColumn>
                            <TableColumn>Arrow</TableColumn>
                            <TableColumn>Receiver</TableColumn>
                            <TableColumn>Class</TableColumn>
                            <TableColumn>Status</TableColumn>
                          </TableHeader>
                          <TableBody>
                            {assignmentsData.assignments.map(
                              (assignment: any) => (
                                <TableRow key={assignment.id}>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">
                                        {assignment.giver.user.firstName}{" "}
                                        {assignment.giver.user.lastName}
                                      </p>
                                      <p className="text-xs text-default-500">
                                        {assignment.giver.user.email}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      color="primary"
                                      size="sm"
                                      variant="flat"
                                    >
                                      {assignment.giver.class?.name ||
                                        "No Class"}
                                    </Chip>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-2xl">→</span>
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">
                                        {assignment.receiver.user.firstName}{" "}
                                        {assignment.receiver.user.lastName}
                                      </p>
                                      <p className="text-xs text-default-500">
                                        {assignment.receiver.user.email}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      color="secondary"
                                      size="sm"
                                      variant="flat"
                                    >
                                      {assignment.receiver.class?.name ||
                                        "No Class"}
                                    </Chip>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      color={
                                        assignment.giver.status ===
                                        "GIFT_SUBMITTED"
                                          ? "success"
                                          : "warning"
                                      }
                                      size="sm"
                                      variant="flat"
                                    >
                                      {assignment.giver.status ===
                                      "GIFT_SUBMITTED"
                                        ? "Gift Submitted"
                                        : "Pending"}
                                    </Chip>
                                  </TableCell>
                                </TableRow>
                              ),
                            )}
                          </TableBody>
                        </Table>

                        <div className="mt-6 p-4 bg-default-50 rounded-lg">
                          <h4 className="font-semibold mb-2">
                            Assignment Summary
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-default-600">
                                Total Assignments:
                              </p>
                              <p className="font-semibold text-lg">
                                {assignmentsData.assignments.length}
                              </p>
                            </div>
                            <div>
                              <p className="text-default-600">
                                Gifts Submitted:
                              </p>
                              <p className="font-semibold text-lg text-success">
                                {
                                  assignmentsData.assignments.filter(
                                    (a: any) =>
                                      a.giver.status === "GIFT_SUBMITTED",
                                  ).length
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-default-600">Pending Gifts:</p>
                              <p className="font-semibold text-lg text-warning">
                                {
                                  assignmentsData.assignments.filter(
                                    (a: any) =>
                                      a.giver.status !== "GIFT_SUBMITTED",
                                  ).length
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-default-500 mb-4">
                          No assignments have been created yet for the current
                          event.
                        </p>
                        <p className="text-sm text-default-400 mb-6">
                          Create assignments to start the Secret Santa gift
                          exchange!
                        </p>
                        <Button
                          color="primary"
                          isLoading={loading}
                          onPress={handleCreateAssignments}
                        >
                          Create Assignments
                        </Button>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}
