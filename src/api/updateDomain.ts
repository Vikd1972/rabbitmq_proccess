import instance from '.';

const updateDomain = async (id: number) => {
  const response = await instance.patch(`/domain/${id}`);

  return response;
};
export default updateDomain;
