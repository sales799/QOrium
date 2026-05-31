import SolutionDetailPage, {
  generateSolutionMetadata,
  solutionStaticParams,
} from '../../_shared-solution';

export const generateStaticParams = () => solutionStaticParams('by-industry');
export const generateMetadata = generateSolutionMetadata;
export default SolutionDetailPage;
