import type { ILink } from '../types';
import instance from '.';

const updateLink = async (newItemLink: ILink) => {
  const response = await instance.post('/link', {
    newItemLink,
  });

  return response;
};
export default updateLink;
