import { Announcement, markAnnouncementAsRead } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useAnnouncementRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      currentCount,
    }: {
      id: string;
      currentCount: number;
    }) => {
      const { success, error } = await markAnnouncementAsRead(id);
      if (!success) throw new Error(error);
      return { id, currentCount };
    },
    onMutate: async ({ id, currentCount }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["announcements"] });

      // Snapshot the previous value
      const previousAnnouncements = queryClient.getQueryData<Announcement[]>([
        "announcements",
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData<Announcement[]>(
        ["announcements"],
        (old = []) => {
          return old.map((announcement) =>
            announcement.id === id
              ? {
                  ...announcement,
                  is_read: true,
                  read_count: (announcement.read_count || 0) + 1,
                }
              : announcement,
          );
        },
      );

      // Return a context object with the snapshotted value
      return { previousAnnouncements };
    },
    onError: (err, newTodo, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousAnnouncements) {
        queryClient.setQueryData(
          ["announcements"],
          context.previousAnnouncements,
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success:
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
};
