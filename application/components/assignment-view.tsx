"use client";

import React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Button,
  Divider,
  Avatar,
} from '@heroui/react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface AssignmentViewProps {
  className?: string;
}

export default function AssignmentView({ className }: AssignmentViewProps) {
  const { data: assignmentData, error, isLoading } = useSWR(
    '/api/assignments',
    fetcher
  );

  if (isLoading) {
    return (
      <Card className={className}>
        <CardBody className="text-center py-8">
          <p>Loading assignment information...</p>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardBody className="text-center py-8">
          <p className="text-red-500">Error loading assignment information</p>
        </CardBody>
      </Card>
    );
  }

  const assignment = assignmentData?.assignment;

  if (!assignment || !assignment.givingAssignment) {
    return (
      <Card className={className}>
        <CardBody className="text-center py-8">
          <div className="max-w-md mx-auto">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">No Assignment Yet</h3>
            <p className="text-default-500 mb-4">
              Assignments haven't been created yet. You'll be notified once the organizers 
              have matched everyone with their gift recipients.
            </p>
            <p className="text-sm text-default-400">
              Make sure you've completed your registration with your class and interests!
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  const recipient = assignment.givingAssignment.receiver;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="text-2xl">🎁</div>
          <div>
            <h2 className="text-xl font-bold">Your Secret Santa Assignment</h2>
            <p className="text-sm text-default-500">
              Here's who you'll be buying a gift for!
            </p>
          </div>
        </div>
      </CardHeader>
      
      <Divider />
      
      <CardBody className="space-y-6">
        {/* Recipient Information */}
        <div className="flex items-start gap-4">
          <Avatar
            src={recipient.user.imageUrl}
            name={`${recipient.user.firstName} ${recipient.user.lastName}`}
            size="lg"
            className="flex-shrink-0"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold">
              {recipient.user.firstName} {recipient.user.lastName}
            </h3>
            {recipient.class && (
              <Chip size="sm" variant="flat" color="primary" className="mt-1">
                Class: {recipient.class.name}
              </Chip>
            )}
          </div>
        </div>

        <Divider />

        {/* Interests Section */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <span>💡</span>
            Interests & Gift Ideas
          </h4>
          {recipient.interests ? (
            <div className="bg-default-50 dark:bg-default-900/20 rounded-lg p-4">
              <p className="text-default-700 dark:text-default-300">
                {recipient.interests}
              </p>
            </div>
          ) : (
            <div className="bg-default-50 dark:bg-default-900/20 rounded-lg p-4">
              <p className="text-default-500 italic">
                No specific interests provided. Consider a general gift that most people would enjoy!
              </p>
            </div>
          )}
        </div>

        <Divider />

        {/* Gift Guidelines */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <span>📋</span>
            Gift Guidelines
          </h4>
          <div className="space-y-2 text-sm text-default-600">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Keep gifts appropriate for school environment</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Consider a budget of €5-15</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Wrap your gift nicely with a tag</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Deliver to the organizers by the deadline</span>
            </div>
          </div>
        </div>

        <Divider />

        {/* Delivery Information */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">
            📦 Delivery Instructions
          </h4>
          <div className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
            <p>• Bring your wrapped gift to the school office</p>
            <p>• Include a label with the recipient's name and class</p>
            <p>• Gifts will be distributed during the Christmas celebration</p>
            <p>• Don't reveal that you're their Secret Santa until the event!</p>
          </div>
        </div>

        {/* Important Note */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600 text-lg">⚠️</span>
            <div>
              <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-1">
                Keep It Secret!
              </h4>
              <p className="text-sm text-yellow-600 dark:text-yellow-300">
                Remember, this is a Secret Santa exchange. Don't tell {recipient.user.firstName} 
                that you're their gift giver. The fun is in the surprise!
              </p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
} 