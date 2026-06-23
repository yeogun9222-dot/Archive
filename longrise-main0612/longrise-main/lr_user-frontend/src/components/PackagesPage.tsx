import { PackageSection } from './PackageSection';

export const PackagesPage = ({
  onInvestClick,
  packages,
  activeInvestments,
}: {
  onInvestClick: (id: string) => void;
  packages?: any[];
  activeInvestments?: any[];
}) => {
  return (
    <div className="pt-24 pb-24 px-6 lg:px-10 max-w-7xl mx-auto">
      <PackageSection onSelect={onInvestClick} packages={packages} activeInvestments={activeInvestments} mode="live" />
    </div>
  );
};
