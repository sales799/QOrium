import SolutionDetailPage, {
  generateSolutionMetadata,
  solutionStaticParams,
} from '../../_shared-solution';

export const generateStaticParams = () => solutionStaticParams('by-company-type');
export const generateMetadata = generateSolutionMetadata;
export default SolutionDetailPage;
