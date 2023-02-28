import type { ILink } from '../types';
import instance from '.';

type ResponseType = {
  link: ILink;
};

const getLink = async (linkId: number) => {
  const response = await instance.get<ResponseType>(`/${linkId}`);

  return response.data.link;
};
export default getLink;
