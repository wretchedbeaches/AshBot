import addZero from 'add-zero';

export const durationFormatter = (ms: number): string => {
	const hours = Math.trunc(ms / 3600000);
	const minutes = Math.trunc(ms / 60000) % 60;
	const seconds = Math.trunc(ms / 1000) % 60;

	if (hours === 0 && minutes === 0 && seconds === 0) return '0s';

	let formattedDuration = `:${addZero(seconds) as string}s`;
	if (hours > 0) formattedDuration = `${addZero(hours) as string}h ${addZero(minutes) as string}m`;
	else if (minutes > 0) formattedDuration = `${addZero(minutes) as string}m ${formattedDuration}`;
	return formattedDuration;
};
