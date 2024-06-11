
import { useQuery } from "@tanstack/react-query";
import { POSTS } from "../../utils/db/dummy";
import PostSkeleton from "../skeletons/PostSkeleton ";
import Post from "./Post ";
import { useEffect } from "react";

const Posts = ({feedType, username,userId}:any) => {
	
	const getPostEndpoint = () => {
		switch (feedType) {
			case 'forYou':
				return '/api/posts/all';
			case 'following':
				return '/api/posts/following';
			case 'posts':
				return `/api/posts/user/${username}` ;
			case "likes":
				return `/api/posts/likes/${userId}`;
			default:
				return '/api/posts/all';
		}
	
	}

	const POST_ENDPOINT = getPostEndpoint();

	const { data: POSTS, isLoading, refetch, isRefetching } = useQuery({
		queryKey: ['posts'],
		queryFn: async () => {
			try {
				const res = await fetch(POST_ENDPOINT);
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.message || 'Something went wrong!');
				}

				return data;
			} catch (error) {
				throw new Error();
			}
			
		},
	
	});

	useEffect(() => {
		refetch();
	}, [feedType,refetch,username]);


	return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && !isRefetching && POSTS?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && !isRefetching && POSTS && (
				<div>
					{POSTS.map((post:any) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;