import type { IDomain } from '../types';
import instance from '.';

type ResponseType = {
  domain: IDomain;
};

const getLink = async (linkId: number) => {
  const response = await instance.get<ResponseType>(`/domain/${linkId}`);

  return response.data.domain;
};
export default getLink;
