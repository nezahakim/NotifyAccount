import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data  }) => {
	const { user, access_token} = data;

	return {
		user: user,
		access_token: access_token,
	};
};
