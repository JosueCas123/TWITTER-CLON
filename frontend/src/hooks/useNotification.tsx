import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast";



export const useNotification = () => {
    const queryClient = useQueryClient();

    const {data:notifications, isLoading} = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            try {
                const res = await fetch(`/api/notification`);
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || "Something went wrong!");
                }
                return data;
            } catch (error) {
                throw new Error();
            }
        },
            
        
       

 });

 const {mutate:deleteNotification} = useMutation({
        mutationFn: async () => {
            try {
                const res = await fetch(`/api/notification`, {
                    method: "DELETE",
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || "Something went wrong!");
                }
                return data;
            } catch (error) {
                throw new Error();
            }
        },
        onSuccess: () => {
            toast.success("Notification deleted successfully");
            queryClient.invalidateQueries({queryKey: ['notifications']});
        },
        onError: (error) => {
            toast.error(error.message);
        },
 });

    return {
        notifications,
        isLoading,
        deleteNotification,
        
    }
}
