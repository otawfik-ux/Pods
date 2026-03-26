import { ActivityCategory, PodCategory } from '../types';

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  'Study',
  'Gym',
  'Social',
  'Sports',
  'Food',
  'Other',
];

export const POD_CATEGORIES: PodCategory[] = [
  'Sports',
  'Study',
  'Social',
  'Food',
  'Gaming',
  'Other',
];

export const PREDEFINED_TAGS: string[] = [
  'Beginner',
  'Advanced',
  'Casual',
  'Competitive',
  'Study Group',
  'Project',
  'Outdoor',
  'Indoor',
  'Weekend',
  'Weekday',
  'Morning',
  'Evening',
  'Late Night',
  'Free',
  'Paid',
];

export const UNIVERSITY_DOMAINS: Record<string, string> = {
  'bu.edu': 'Boston University',
  'mit.edu': 'MIT',
  'harvard.edu': 'Harvard University',
  'stanford.edu': 'Stanford University',
  'ucla.edu': 'UCLA',
  'usc.edu': 'University of Southern California',
  'nyu.edu': 'New York University',
  'columbia.edu': 'Columbia University',
  'cornell.edu': 'Cornell University',
  'yale.edu': 'Yale University',
  'princeton.edu': 'Princeton University',
  'upenn.edu': 'University of Pennsylvania',
  'brown.edu': 'Brown University',
  'dartmouth.edu': 'Dartmouth College',
  'umich.edu': 'University of Michigan',
  'uchicago.edu': 'University of Chicago',
  'gatech.edu': 'Georgia Tech',
  'cmu.edu': 'Carnegie Mellon University',
  'duke.edu': 'Duke University',
  'vanderbilt.edu': 'Vanderbilt University',
  'georgetown.edu': 'Georgetown University',
  'northwestern.edu': 'Northwestern University',
  'emory.edu': 'Emory University',
  'nd.edu': 'University of Notre Dame',
  'unc.edu': 'UNC Chapel Hill',
  'virginia.edu': 'University of Virginia',
  'wustl.edu': 'Washington University in St. Louis',
  'rice.edu': 'Rice University',
  'tufts.edu': 'Tufts University',
  'bc.edu': 'Boston College',
  'northeastern.edu': 'Northeastern University',
};

export function getUniversityFromEmail(email: string): string {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return 'Unknown University';
  return UNIVERSITY_DOMAINS[domain] ?? `${domain.split('.')[0].toUpperCase()} University`;
}

export function isEduEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  return domain.endsWith('.edu');
}
