import * as zod from 'zod';

export const supported_site = zod.object({
  hostname: zod.string({ message: 'hostname is required' }).min(1, { message: 'hostname is required' }),
  _id: zod.string(),
});

export type SupportedSite = zod.infer<typeof supported_site>;
