import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';


export const useUserProfile = () => {
    const {username} = useParams();
    const {data:user, isLoading, isRefetching, refetch} = useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            try {
                const res = await fetch(`/api/user/profile/${username}`);
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
    return {
        user,
        isLoading,
        isRefetching,
        refetch,
        username,
    }
}
