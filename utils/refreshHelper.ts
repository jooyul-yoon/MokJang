import { queryClient } from "@/lib/react-query";

export const onRefreshHelper = async (
  setRefreshing: React.Dispatch<React.SetStateAction<boolean>>,
  keys: string[],
) => {
  setRefreshing(true);

  await Promise.all(
    keys.map((key) =>
      queryClient.invalidateQueries({
        queryKey: [key],
      }),
    ),
  );

  await new Promise((resolve) => setTimeout(resolve, 1000));
  setRefreshing(false);
};
