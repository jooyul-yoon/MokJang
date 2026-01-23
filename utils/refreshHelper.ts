import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const onRefreshHelper = (
  setRefreshing: React.Dispatch<React.SetStateAction<boolean>>,
  keys: string[],
) => {
  setRefreshing(true);
  keys.forEach((key) => {
    queryClient.invalidateQueries({
      queryKey: [key],
    });
  });
  setTimeout(() => {
    setRefreshing(false);
  }, 1000);
};
