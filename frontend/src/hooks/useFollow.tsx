import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";



export const useFollow = () => {

    const queryClient = useQueryClient();

    const {mutate:follow, isPending} = useMutation({
        mutationFn : async (userId:string) => {
            try {
                const res = await fetch(`/api/user/follow/${userId}`, {
                    method: "POST",
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || "Something went wrong!");
                }
                return data;
            } catch (error:any) {
                throw new Error(error);
            }
        },
        onSuccess: () => {
            Promise.all([
                queryClient.invalidateQueries({queryKey: ["sussgestedUsers"]}),
                queryClient.invalidateQueries({queryKey:["authUser"]}),
              
            ]);
        },
        onError: (error:any) => {
            toast.error(error.message);
        }

    })

    return {
        follow,
        isPending,
    }

}
