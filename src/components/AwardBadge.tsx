import TrophyIcon from "./TrophyIcon";

export default function AwardBadge() {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
      <TrophyIcon />
      Best Paper Award
    </span>
  );
}
