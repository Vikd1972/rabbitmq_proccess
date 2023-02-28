import getLink from '../api/getLinks';
import parsingLinks from './parsingLinks';

const jobHandler = async (data: string) => {
  const linkId = Number(data.split(' ')[0]);
  const numberOfStreams = Number(data.split(' ')[1]);

  const itemLink = await getLink(linkId);

  parsingLinks(itemLink, numberOfStreams);
};

export default jobHandler;
