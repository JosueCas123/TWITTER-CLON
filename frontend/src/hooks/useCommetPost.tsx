import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";




export const useCommetPost = () => {
    const queryClient = useQueryClient();
    const [comment, setComment] = useState("");

    const {mutate:commentPost, isPending} = useMutation({
        mutationFn: async (commetPost:string) =>{
            try {
                const res = await fetch(`/api/posts/comment/${commetPost}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({text:comment}),
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
            toast.success("Post deleted successfully");
            queryClient.invalidateQueries({queryKey: ['posts']});
        },
        onError: () => {
            toast.error("Something went wrong");

        },
    
        
    });
    return {
        commentPost,
        isPending,
        comment,
        setComment,
    }
}

