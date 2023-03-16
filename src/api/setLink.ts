import type { ILink } from '../types';
import instance from '.';

type ResponseType = {
  link: ILink;
};

const setLink = async (newItemLink: ILink) => {
  const response = await instance.post<ResponseType>('/link', {
    newItemLink,
  });

  return response.data.link;
};
export default setLink;
