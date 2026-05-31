import SolutionDetailPage, {
  generateSolutionMetadata,
  solutionStaticParams,
} from '../../_shared-solution';

export const generateStaticParams = () => solutionStaticParams('by-use-case');
export const generateMetadata = generateSolutionMetadata;
export default SolutionDetailPage;
