"use client";

import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Divider,
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
} from '@heroui/react';
import useSWR from 'swr';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import EventManager from './event-manager';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface AdminDashboardProps {
  className?: string;
}

export default function AdminDashboard({ className }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState(false);

  // Fetch statistics
  const { data: statsData, error: statsError, mutate: mutateStats } = useSWR(
    '/api/statistics',
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30 seconds
  );

  // Fetch presents data
  const { data: presentsData, mutate: mutatePresents } = useSWR(
    '/api/presents',
    fetcher
  );

  // Add assignments data fetching
  const { data: assignmentsData, mutate: mutateAssignments } = useSWR(
    '/api/assignments',
    fetcher
  );



  const stats = statsData?.data?.stats || {};
  const chartData = statsData?.data || {};

  const handleCreateAssignments = async () => {
    if (!confirm('Are you sure you want to create assignments? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        await mutateStats();
        await mutateAssignments(); // Refresh assignments data
        alert('Assignments created successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create assignments');
      }
    } catch (error) {
      console.error('Error creating assignments:', error);
      alert('Failed to create assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPresent = async (action: string, participantId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/presents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, participantId }),
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        mutatePresents();
        mutateStats();
      } else {
        alert(result.error || 'Failed to update present');
      }
    } catch (error) {
      console.error('Error updating present:', error);
      alert('Failed to update present');
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
              onPress={handleCreateAssignments}
              isLoading={loading}
              disabled={loading}
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

      {/* Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold mb-4">Present Collection Progress</h3>
            <Progress
              value={stats.totalParticipants > 0 ? (stats.submittedPresents / stats.totalParticipants) * 100 : 0}
              color="success"
              showValueLabel={true}
              className="mb-2"
            />
            <p className="text-sm text-default-500">
              {stats.submittedPresents || 0} of {stats.totalParticipants || 0} presents collected
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold mb-4">Delivery Progress</h3>
            <Progress
              value={stats.totalParticipants > 0 ? (stats.deliveredPresents / stats.totalParticipants) * 100 : 0}
              color="primary"
              showValueLabel={true}
              className="mb-2"
            />
            <p className="text-sm text-default-500">
              {stats.deliveredPresents || 0} of {stats.totalParticipants || 0} presents delivered
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Tabs for detailed views */}
      <Card>
        <CardBody>
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            aria-label="Dashboard tabs"
          >
            <Tab key="overview" title="Overview">
              <div className="space-y-6 mt-4">
                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Registrations over time */}
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Registrations Over Time</h3>
                    </CardHeader>
                    <CardBody>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData.registrationsByDate || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="dateFormatted" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="cumulative"
                            stroke="#8884d8"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardBody>
                  </Card>

                  {/* Class distribution */}
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Participants by Class</h3>
                    </CardHeader>
                    <CardBody>
                      <ResponsiveContainer width="100%" height={300}>
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
                    <h3 className="text-lg font-semibold">Recent Registrations</h3>
                  </CardHeader>
                  <CardBody>
                    <Table aria-label="Recent registrations">
                      <TableHeader>
                        <TableColumn>Name</TableColumn>
                        <TableColumn>Class</TableColumn>
                        <TableColumn>Registered</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {(chartData.recentActivity || []).map((activity: any) => (
                          <TableRow key={activity.id}>
                            <TableCell>{activity.userName}</TableCell>
                            <TableCell>
                              <Chip size="sm" variant="flat">
                                {activity.className}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              {format(new Date(activity.registeredAt), 'MMM dd, HH:mm')}
                            </TableCell>
                          </TableRow>
                        ))}
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
                    <h3 className="text-lg font-semibold">Participant Management</h3>
                  </CardHeader>
                  <CardBody>
                    <Table aria-label="Participants">
                      <TableHeader>
                        <TableColumn>Name</TableColumn>
                        <TableColumn>Email</TableColumn>
                        <TableColumn>Class</TableColumn>
                        <TableColumn>Actions</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {(presentsData?.presents || []).map((participant: any) => (
                          <TableRow key={participant.id}>
                            <TableCell>
                              {participant.user.firstName} {participant.user.lastName}
                            </TableCell>
                            <TableCell>{participant.user.email}</TableCell>
                            <TableCell>
                              <Chip size="sm" variant="flat">
                                {participant.class?.name || 'No Class'}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  color="warning"
                                  variant="flat"
                                  onPress={() => handleMarkPresent('mark_submitted', participant.id)}
                                  isLoading={loading}
                                >
                                  Mark Submitted
                                </Button>
                                <Button
                                  size="sm"
                                  color="success"
                                  variant="flat"
                                  onPress={() => handleMarkPresent('mark_delivered', participant.id)}
                                  isLoading={loading}
                                >
                                  Mark Delivered
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardBody>
                </Card>
              </div>
            </Tab>

            <Tab key="assignments" title="Assignments">
              <div className="mt-4">
                <Card>
                  <CardHeader className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Assignment Overview</h3>
                    {assignmentsData?.assignments && assignmentsData.assignments.length === 0 && (
                      <Button
                        color="primary"
                        onPress={handleCreateAssignments}
                        isLoading={loading}
                      >
                        Create Assignments
                      </Button>
                    )}
                  </CardHeader>
                  <CardBody>
                    {!assignmentsData?.event ? (
                      <div className="text-center py-8">
                        <p className="text-default-500 mb-4">
                          No active event found. Please create and activate an event first.
                        </p>
                      </div>
                    ) : assignmentsData.assignments && assignmentsData.assignments.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm text-default-600">
                              <strong>Event:</strong> {assignmentsData.event.name}
                            </p>
                            <p className="text-sm text-default-500">
                              {assignmentsData.assignments.length} assignments created
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
                            {assignmentsData.assignments.map((assignment: any) => (
                              <TableRow key={assignment.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">
                                      {assignment.giver.user.firstName} {assignment.giver.user.lastName}
                                    </p>
                                    <p className="text-xs text-default-500">
                                      {assignment.giver.user.email}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Chip size="sm" variant="flat" color="primary">
                                    {assignment.giver.class?.name || 'No Class'}
                                  </Chip>
                                </TableCell>
                                <TableCell>
                                  <span className="text-2xl">→</span>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">
                                      {assignment.receiver.user.firstName} {assignment.receiver.user.lastName}
                                    </p>
                                    <p className="text-xs text-default-500">
                                      {assignment.receiver.user.email}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Chip size="sm" variant="flat" color="secondary">
                                    {assignment.receiver.class?.name || 'No Class'}
                                  </Chip>
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    size="sm" 
                                    color={assignment.giver.status === 'GIFT_SUBMITTED' ? 'success' : 'warning'}
                                    variant="flat"
                                  >
                                    {assignment.giver.status === 'GIFT_SUBMITTED' ? 'Gift Submitted' : 'Pending'}
                                  </Chip>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        <div className="mt-6 p-4 bg-default-50 rounded-lg">
                          <h4 className="font-semibold mb-2">Assignment Summary</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-default-600">Total Assignments:</p>
                              <p className="font-semibold text-lg">{assignmentsData.assignments.length}</p>
                            </div>
                            <div>
                              <p className="text-default-600">Gifts Submitted:</p>
                              <p className="font-semibold text-lg text-success">
                                {assignmentsData.assignments.filter((a: any) => a.giver.status === 'GIFT_SUBMITTED').length}
                              </p>
                            </div>
                            <div>
                              <p className="text-default-600">Pending Gifts:</p>
                              <p className="font-semibold text-lg text-warning">
                                {assignmentsData.assignments.filter((a: any) => a.giver.status !== 'GIFT_SUBMITTED').length}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-default-500 mb-4">
                          No assignments have been created yet for the current event.
                        </p>
                        <p className="text-sm text-default-400 mb-6">
                          Create assignments to start the Secret Santa gift exchange!
                        </p>
                        <Button
                          color="primary"
                          onPress={handleCreateAssignments}
                          isLoading={loading}
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