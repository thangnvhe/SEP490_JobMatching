// import { BaseServices } from './base.service';
import type { 
  JobTest as Job, 
  JobSearchParams, 
  JobSearchResponse
} from '@/models/job';
import {
  MOCK_CATEGORIES,
  MOCK_JOB_TYPES,
  MOCK_EXPERIENCE_LEVELS,
  MOCK_DATE_POSTED_OPTIONS,
  MOCK_POPULAR_TAGS
} from '@/models/job';

// Mock data for development
const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Forward Security Director',
    company: {
      id: 'c1',
      name: 'Bauch, Schuppe and Schulist Co',
      logo: '/api/placeholder/40/40'
    },
    description: 'We are looking for a skilled Forward Security Director to join our team...',
    category: { id: '3', name: 'Hotels & Tourism' },
    jobType: { id: '1', name: 'Full time' },
    experienceLevel: { id: '3', name: 'Intermediate' },
    salary: { min: 40000, max: 42000, currency: '$' },
    location: { city: 'New York', country: 'USA' },
    requirements: ['5+ years experience', 'Security clearance', 'Leadership skills'],
    benefits: ['Health insurance', 'Paid time off', 'Remote work'],
    tags: ['security', 'management', 'enterprise'],
    postedDate: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    isActive: true,
    isUrgent: false,
    applicationCount: 15
  },
  {
    id: '2',
    title: 'Regional Creative Facilitator',
    company: {
      id: 'c2',
      name: 'Wisozk - Becker Co',
      logo: '/api/placeholder/40/40'
    },
    description: 'Join our creative team as a Regional Creative Facilitator...',
    category: { id: '6', name: 'Media' },
    jobType: { id: '2', name: 'Part time' },
    experienceLevel: { id: '2', name: 'Fresher' },
    salary: { min: 28000, max: 32000, currency: '$' },
    location: { city: 'Los Angeles', country: 'USA' },
    requirements: ['Creative portfolio', 'Team collaboration', 'Adobe Creative Suite'],
    benefits: ['Flexible hours', 'Creative environment', 'Learning opportunities'],
    tags: ['creative', 'design', 'media'],
    postedDate: new Date(Date.now() - 12 * 60 * 1000).toISOString(), // 12 minutes ago
    expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    isUrgent: true,
    applicationCount: 8
  },
  {
    id: '3',
    title: 'Internal Integration Planner',
    company: {
      id: 'c3',
      name: 'Mraz, Quigley and Feest Inc.',
      logo: '/api/placeholder/40/40'
    },
    description: 'We need an experienced Internal Integration Planner...',
    category: { id: '7', name: 'Construction' },
    jobType: { id: '1', name: 'Full time' },
    experienceLevel: { id: '3', name: 'Intermediate' },
    salary: { min: 48000, max: 50000, currency: '$' },
    location: { city: 'Texas', country: 'USA' },
    requirements: ['Project management', 'Integration experience', 'Technical skills'],
    benefits: ['Competitive salary', 'Growth opportunities', 'Team environment'],
    tags: ['integration', 'planning', 'technical'],
    postedDate: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    isUrgent: false,
    applicationCount: 12
  },
  {
    id: '4',
    title: 'District Intranet Director',
    company: {
      id: 'c4',
      name: 'VonRueden - Weber Co',
      logo: '/api/placeholder/40/40'
    },
    description: 'Looking for a District Intranet Director to lead our team...',
    category: { id: '1', name: 'Commerce' },
    jobType: { id: '1', name: 'Full time' },
    experienceLevel: { id: '4', name: 'Expert' },
    salary: { min: 42000, max: 48000, currency: '$' },
    location: { city: 'Florida', country: 'USA' },
    requirements: ['Network management', 'Leadership', '8+ years experience'],
    benefits: ['Executive package', 'Stock options', 'Premium healthcare'],
    tags: ['networking', 'leadership', 'enterprise'],
    postedDate: new Date(Date.now() - 24 * 60 * 1000).toISOString(), // 24 minutes ago
    expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    isUrgent: false,
    applicationCount: 25
  },
  {
    id: '5',
    title: 'Corporate Tactics Facilitator',
    company: {
      id: 'c5',
      name: 'Cormier, Turner and Flatley Inc',
      logo: '/api/placeholder/40/40'
    },
    description: 'We are hiring a Corporate Tactics Facilitator...',
    category: { id: '1', name: 'Commerce' },
    jobType: { id: '1', name: 'Full time' },
    experienceLevel: { id: '3', name: 'Intermediate' },
    salary: { min: 38000, max: 40000, currency: '$' },
    location: { city: 'Boston', country: 'USA' },
    requirements: ['Strategic thinking', 'Business analysis', 'Communication skills'],
    benefits: ['Professional development', 'Work-life balance', 'Bonus structure'],
    tags: ['strategy', 'business', 'consulting'],
    postedDate: new Date(Date.now() - 26 * 60 * 1000).toISOString(), // 26 minutes ago
    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    isUrgent: false,
    applicationCount: 18
  },
  {
    id: '6',
    title: 'Forward Accounts Consultant',
    company: {
      id: 'c6',
      name: 'Miller Group',
      logo: '/api/placeholder/40/40'
    },
    description: 'Join Miller Group as a Forward Accounts Consultant...',
    category: { id: '5', name: 'Financial services' },
    jobType: { id: '1', name: 'Full time' },
    experienceLevel: { id: '3', name: 'Intermediate' },
    salary: { min: 45000, max: 48000, currency: '$' },
    location: { city: 'Boston', country: 'USA' },
    requirements: ['Financial analysis', 'Client management', 'CPA preferred'],
    benefits: ['Financial planning', 'Retirement matching', 'Health benefits'],
    tags: ['finance', 'consulting', 'client-service'],
    postedDate: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    isUrgent: false,
    applicationCount: 22
  }
];

class JobService {
  private static instance: JobService;


  public static getInstance(): JobService {
    if (!JobService.instance) {
      JobService.instance = new JobService();
    }
    return JobService.instance;
  }

  /**
   * Search jobs with filters and pagination
   */
  async searchJobs(params: JobSearchParams): Promise<JobSearchResponse> {
    try {
      // In a real application, this would make an API call
      // For now, we'll simulate with mock data and client-side filtering
      
      let filteredJobs = [...MOCK_JOBS];

      // Apply keyword filter
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase();
        filteredJobs = filteredJobs.filter(job => 
          job.title.toLowerCase().includes(keyword) ||
          job.company.name.toLowerCase().includes(keyword) ||
          job.description.toLowerCase().includes(keyword)
        );
      }

      // Apply location filter
      if (params.location) {
        filteredJobs = filteredJobs.filter(job => 
          job.location.city.toLowerCase().includes(params.location!.toLowerCase()) ||
          job.location.country.toLowerCase().includes(params.location!.toLowerCase())
        );
      }

      // Apply category filter
      if (params.categories && params.categories.length > 0) {
        filteredJobs = filteredJobs.filter(job => 
          params.categories!.includes(job.category.id)
        );
      }

      // Apply job type filter
      if (params.jobTypes && params.jobTypes.length > 0) {
        filteredJobs = filteredJobs.filter(job => 
          params.jobTypes!.includes(job.jobType.id)
        );
      }

      // Apply experience level filter
      if (params.experienceLevels && params.experienceLevels.length > 0) {
        filteredJobs = filteredJobs.filter(job => 
          params.experienceLevels!.includes(job.experienceLevel.id)
        );
      }

      // Apply salary range filter
      if (params.salaryRange) {
        filteredJobs = filteredJobs.filter(job => 
          job.salary.min >= params.salaryRange!.min && 
          job.salary.max <= params.salaryRange!.max
        );
      }

      // Apply tags filter
      if (params.tags && params.tags.length > 0) {
        filteredJobs = filteredJobs.filter(job => 
          params.tags!.some(tag => job.tags.includes(tag))
        );
      }

      // Apply date posted filter
      if (params.datePosted && params.datePosted !== 'all') {
        const now = new Date();
        let cutoffDate: Date;

        switch (params.datePosted) {
          case 'last-hour':
            cutoffDate = new Date(now.getTime() - 60 * 60 * 1000);
            break;
          case 'last-24-hours':
            cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case 'last-7-days':
            cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'last-30-days':
            cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            cutoffDate = new Date(0);
        }

        filteredJobs = filteredJobs.filter(job => 
          new Date(job.postedDate) >= cutoffDate
        );
      }

      // Apply sorting
      filteredJobs.sort((a, b) => {
        switch (params.sortBy) {
          case 'latest':
            return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
          case 'oldest':
            return new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime();
          case 'salary-high':
            return b.salary.max - a.salary.max;
          case 'salary-low':
            return a.salary.min - b.salary.min;
          case 'relevance':
          default:
            return 0; // Keep original order for relevance
        }
      });

      // Apply pagination
      const total = filteredJobs.length;
      const totalPages = Math.ceil(total / params.limit);
      const startIndex = (params.page - 1) * params.limit;
      const endIndex = startIndex + params.limit;
      const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        jobs: paginatedJobs,
        total,
        page: params.page,
        limit: params.limit,
        totalPages,
        filters: {
          categories: MOCK_CATEGORIES,
          jobTypes: MOCK_JOB_TYPES,
          experienceLevels: MOCK_EXPERIENCE_LEVELS,
          datePostedOptions: MOCK_DATE_POSTED_OPTIONS,
          popularTags: MOCK_POPULAR_TAGS,
        }
      };

    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  }

  /**
   * Get job details by ID
   */
  async getJobById(id: string): Promise<Job | null> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const job = MOCK_JOBS.find(job => job.id === id);
      return job || null;
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  }

  /**
   * Save job to user's saved jobs list
   */
  async saveJob(jobId: string): Promise<boolean> {
    try {
      // In a real application, this would make an API call to save the job
      console.log('Saving job:', jobId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return true;
    } catch (error) {
      console.error('Error saving job:', error);
      throw error;
    }
  }

  /**
   * Remove job from user's saved jobs list
   */
  async unsaveJob(jobId: string): Promise<boolean> {
    try {
      // In a real application, this would make an API call to remove the job
      console.log('Removing saved job:', jobId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return true;
    } catch (error) {
      console.error('Error removing saved job:', error);
      throw error;
    }
  }

  /**
   * Get similar jobs based on category, location, and experience level
   */
  async getSimilarJobs(jobId: string, limit: number = 6): Promise<Job[]> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const currentJob = MOCK_JOBS.find(job => job.id === jobId);
      if (!currentJob) {
        return [];
      }

      // Find similar jobs based on category, experience level, and location
      const similarJobs = MOCK_JOBS.filter(job => {
        if (job.id === jobId) return false;
        
        // Score similarity based on multiple factors
        let score = 0;
        
        // Same category gets highest score
        if (job.category.id === currentJob.category.id) score += 5;
        
        // Same experience level
        if (job.experienceLevel.id === currentJob.experienceLevel.id) score += 3;
        
        // Same location
        if (job.location.city === currentJob.location.city) score += 2;
        
        // Similar salary range
        const salaryDiff = Math.abs(job.salary.min - currentJob.salary.min);
        if (salaryDiff <= 10000) score += 2;
        
        // Same job type
        if (job.jobType.id === currentJob.jobType.id) score += 1;
        
        // Similar tags
        const commonTags = job.tags.filter(tag => currentJob.tags.includes(tag));
        score += commonTags.length;
        
        return score >= 3; // Minimum similarity threshold
      })
      .sort((a, b) => {
        // Sort by similarity score (recalculate for sorting)
        let scoreA = 0, scoreB = 0;
        
        if (a.category.id === currentJob.category.id) scoreA += 5;
        if (b.category.id === currentJob.category.id) scoreB += 5;
        
        if (a.experienceLevel.id === currentJob.experienceLevel.id) scoreA += 3;
        if (b.experienceLevel.id === currentJob.experienceLevel.id) scoreB += 3;
        
        return scoreB - scoreA;
      })
      .slice(0, limit);

      return similarJobs;
    } catch (error) {
      console.error('Error fetching similar jobs:', error);
      throw error;
    }
  }

  /**
   * Apply to a job
   */
  async applyToJob(jobId: string): Promise<boolean> {
    try {
      // In a real application, this would make an API call to submit application
      console.log('Applying to job:', jobId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error('Error applying to job:', error);
      throw error;
    }
  }
}

export const jobService = JobService.getInstance();