import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { SkeletonText } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface AnnouncementListProps {
  announcements: Announcement[];
  isLoading?: boolean;
}

export default function AnnouncementList({
  announcements,
  isLoading = false,
}: AnnouncementListProps) {
  if (isLoading) {
    return (
      <VStack className="gap-4">
        <Heading
          size="md"
          className="mb-2 text-typography-black dark:text-typography-white"
        >
          Church Announcements
        </Heading>
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="dark:bg-background-card-dark rounded-lg bg-white p-4 shadow-sm"
          >
            <SkeletonText _lines={1} className="mb-2 h-6 w-3/4" />
            <SkeletonText _lines={2} className="mb-2 h-4 w-full" />
            <SkeletonText _lines={1} className="h-3 w-1/4" />
          </Card>
        ))}
      </VStack>
    );
  }

  return (
    <VStack className="gap-4">
      <Heading
        size="md"
        className="mb-2 text-typography-black dark:text-typography-white"
      >
        Church Announcements
      </Heading>
      {announcements.map((announcement) => (
        <Card
          key={announcement.id}
          className="dark:bg-background-card-dark rounded-lg bg-white p-4 shadow-sm"
        >
          <Text className="mb-1 text-lg font-bold text-typography-black dark:text-typography-white">
            {announcement.title}
          </Text>
          <Text className="text-typography-gray-600 dark:text-typography-gray-400 text-sm">
            {announcement.content}
          </Text>
          <Text className="text-typography-gray-400 mt-2 text-xs">
            {new Date(announcement.created_at).toLocaleDateString()}
          </Text>
        </Card>
      ))}
    </VStack>
  );
}
