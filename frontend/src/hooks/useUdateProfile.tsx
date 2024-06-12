import { useMutation, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";

export const useUdateProfile = () => {
    const queryClient = useQueryClient();

	const { mutateAsync: updateProfile, isPending: isUpdatingProfile }:any= useMutation({
		mutationFn: async (formData) => {
			try {
				const res = await fetch(`/api/user/update`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(formData),
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error:any) {
				throw new Error(error.message);
			}
		},
		onSuccess: () => {
			toast.success("Profile updated successfully");
			Promise.all([
				queryClient.invalidateQueries({ queryKey: ["authUser"] }),
				queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
			]);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return { updateProfile, isUpdatingProfile };

}

