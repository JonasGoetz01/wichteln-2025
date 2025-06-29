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

  // Fetch assignments data
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

      const result = await response.json();
      if (response.ok) {
        alert(result.message || 'Assignments created successfully!');
        mutateAssignments();
      } else {
        alert(result.error || 'Failed to create assignments');
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
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Assignment Overview</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="text-center py-8">
                      <p className="text-default-500 mb-4">
                        Assignment system will be available once the event is fully configured.
                      </p>
                      <Button
                        color="primary"
                        onPress={handleCreateAssignments}
                        isLoading={loading}
                      >
                        Create Assignments
                      </Button>
                    </div>
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