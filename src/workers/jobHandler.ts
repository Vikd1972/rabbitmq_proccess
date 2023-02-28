import getLink from '../api/getLinks';
import parsingLinks from './parsingLinks';

const jobHandler = async (linkId: number) => {
  const itemLink = await getLink(linkId);
  // console.log(itemLink);
  parsingLinks(itemLink);
};

export default jobHandler;
