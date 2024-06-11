

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast';


export const useLike = () => {
    const queryClient = useQueryClient();
    const {mutate:likePost, isPending:isLiking} = useMutation ({
        mutationFn: async (post:any) => {
            try {
                const resp = await fetch(`/api/posts/like/${post}`, {
                    method: "POST",
                })
                const data = await resp.json();
                if (!resp.ok) {
                    throw new Error(data.message || "Something went wrong!");
                }
                return data;
            } catch (error:any) {
                throw new Error(error);
            }
        },

        onSuccess: (updateLikes) => {
            toast.success("Post liked successfully");
            queryClient.setQueryData(["posts"],(oldData:any)=> {

                return oldData.map((p:any) => {
                    if(p._id === post?._id) {
                        return {...p, likes: updateLikes};
                    }
                    return p;
                })
            })
            
        },

        onError: (error:any) => {
            toast.error(error.message);
        }
    })

    return {
        likePost,
        isLiking,
    }
}
