import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";

import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner ";

import { useCommetPost } from "../../hooks/useCommetPost";
import ReactTimeago from "react-timeago";

const Post = ({ post }:any) => {
	
	console.log("post",post);
	const {data:authUser}:any= useQuery({queryKey: ['authUser']});
	const queryClient = useQueryClient();
	const postOwner = post.user;
	const isLiked = post.likes.includes(authUser?._id);
	const isMyPost = authUser?._id === post.user?._id;
	const {mutate:delet, isPending:isDelete} = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`/api/posts/${post._id}`, {
					method: "DELETE",
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.message || "Something went wrong!");
				}
			} catch (error) {
				throw new Error();
			}
		},
		onSuccess: () => {
			toast.success("Post deleted successfully");
			queryClient.invalidateQueries({queryKey: ['posts']});
		},
		onError: () => {},
	
	});


	//hook para dar like
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
	//hook para comentar
	const {commentPost, isPending,comment,setComment} = useCommetPost();

	const formattedDate = <ReactTimeago date={new Date(post.createdAt)} locale="e-ES"/>;

	const isCommenting = false;

	const handleDeletePost = () => {
		delet();
	};

	const handlePostComment = (e:any) => {
		e.preventDefault();
		if (comment.trim() === "") return;
		commentPost(post._id);
		console.log("comment",post.comments);
	};

	const handleLikePost = () => {
		
		 if(isLiking) return;
		 likePost(post?._id);
	};
	

	return (
		<>
			<div className='flex gap-2 items-start p-4 border-b border-gray-700'>
				<div className='avatar'>
					<Link to={`/profile/${postOwner?.username}`} className='w-8 h-8 rounded-full overflow-hidden'>
						<img src={postOwner?.profileImage || "/avatar-placeholder.png"} />
					</Link>
				</div>
				<div className='flex flex-col flex-1'>
					<div className='flex gap-2 items-center'>
						<Link to={`/profile/${postOwner?.username}`} className='font-bold'>
							{postOwner?.fullName}
						</Link>
						<span className='text-gray-700 flex gap-1 text-sm'>
							<Link to={`/profile/${postOwner?.username}`}>@{postOwner?.username}</Link>
							<span>·</span>
							<span>{formattedDate}</span>
						</span>
						{isMyPost && (
							<span className='flex justify-end flex-1'>
								{!isDelete && <FaTrash className='cursor-pointer hover:text-red-500' onClick={handleDeletePost} />}
								{
									isDelete && (
										<LoadingSpinner size="lg"/>
									)
								}
							</span>
						)}
					</div>
					<div className='flex flex-col gap-3 overflow-hidden'>
						<span>{post?.text}</span>
						{post?.img && (
							<img
								src={post?.img}
								className='h-80 object-contain rounded-lg border border-gray-700'
								alt=''
							/>
						)}
					</div>
					<div className='flex justify-between mt-3'>
						<div className='flex gap-4 items-center w-2/3 justify-between'>
<div
    className='flex gap-1 items-center cursor-pointer group'
    onClick={() => {
        const modal = document.getElementById("comments_modal" + post?._id) as HTMLDialogElement;
        if (modal) {
            modal.showModal();
        }
    }}
>
    <FaRegComment className='w-4 h-4  text-slate-500 group-hover:text-sky-400' />
    <span className='text-sm text-slate-500 group-hover:text-sky-400'>
        {post.comments.length}
    </span>
</div>
							{/* We're using Modal Component from DaisyUI */}
							<dialog id={`comments_modal${post?._id}`} className='modal border-none outline-none'>
								<div className='modal-box rounded border border-gray-600'>
									<h3 className='font-bold text-lg mb-4'>COMMENTS</h3>
									<div className='flex flex-col gap-3 max-h-60 overflow-auto'>
										{post?.comments.length === 0 && (
											<p className='text-sm text-slate-500'>
												No comments yet 🤔 Be the first one 😉
											</p>
										)}
										{post.comments.map((comment:any) => (
											<div key={comment?._id} className='flex gap-2 items-start'>
												<div className='avatar'>
													<div className='w-8 rounded-full'>
														<img
															src={comment?.user?.profileImg || "/avatar-placeholder.png"}
														/>
													</div>
												</div>
												<div className='flex flex-col'>
													<div className='flex items-center gap-1'>
														<span className='font-bold'>{comment?.user?.fullName}</span>
														<span className='text-gray-700 text-sm'>
															@{comment?.user?.username}
														</span>
													</div>
									
													<div className='text-sm'>{comment?.text}</div>
												</div>
											</div>
										))}
									</div>
									<form
										className='flex gap-2 items-center mt-4 border-t border-gray-600 pt-2'
										onSubmit={handlePostComment}
									>
										<textarea
											className='textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800'
											placeholder='Add a comment...'
											value={comment}
											onChange={(e) => setComment(e.target.value)}
										/>
										<button className='btn btn-primary rounded-full btn-sm text-white px-4'>
											{isCommenting ? (
												<span className='loading loading-spinner loading-md'></span>
											) : (
												isPending ? "Posting..." : "Post"
											)}
										</button>
									</form>
								</div>
								<form method='dialog' className='modal-backdrop'>
									<button className='outline-none'>close</button>
								</form>
							</dialog>
							<div className='flex gap-1 items-center group cursor-pointer'>
								<BiRepost className='w-6 h-6  text-slate-500 group-hover:text-green-500' />
								<span className='text-sm text-slate-500 group-hover:text-green-500'>0</span>
							</div>
							<div className='flex gap-1 items-center group cursor-pointer' onClick={handleLikePost}>
								{isLiking && <LoadingSpinner size='sm' />}
								{!isLiked && !isLiking && (
									<FaRegHeart className='w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500' />
								)}
								{isLiked && !isLiking && (
									<FaRegHeart className='w-4 h-4 cursor-pointer text-pink-500 ' />
								)}

								<span
									className={`text-sm  group-hover:text-pink-500 ${
										isLiked ? "text-pink-500" : "text-slate-500"
									}`}
								>
									{post?.likes?.length}
								</span>
							</div>
						</div>
						<div className='flex w-1/3 justify-end gap-2 items-center'>
							<FaRegBookmark className='w-4 h-4 text-slate-500 cursor-pointer' />
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
export default Post;