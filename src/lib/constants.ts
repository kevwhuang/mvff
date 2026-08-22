export const LINKS = {
    calendly: 'https://calendly.com/madewellanna99/30min',
    email: 'mailto:contact@atxmusicvideofilmfestival.com',
    filmfreeway: 'https://filmfreeway.com/atxmusicvideofilmfestival',
    instagram: 'https://instagram.com/atxmvff',
    phone: 'tel:+12814669387',
    pitchDeck: '/assets/austin_music_video_film_festival_pitch_deck.pdf',
    review: 'https://g.page/r/CdaZb_RsbGsEEBM/review',
} as const;

export const LOADER_SHOWN_KEY = 'mvff_loader_shown';

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export const RESIZE_SETTLE_DELAY = 150;

export const ROUTES = [
    { href: '/', label: 'Home' },
    { href: '/info', label: 'Info' },
    { href: '/team', label: 'Team' },
    { href: '/gallery', label: 'Gallery' },
    { href: 'https://shop.atxmusicvideofilmfestival.com', label: 'Store' },
] as const;
