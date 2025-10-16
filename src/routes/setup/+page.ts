import { authStore } from '$lib/stores/auth';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data  }) => {

	const { success, message, user, access_token} = data;

	if (!success) {
		console.log(message);

		return {
			user: null,
			access_token: null
		};
	}

	authStore.login(user, access_token);

	return {
		user: user,
		access_token: access_token,
	};
};
