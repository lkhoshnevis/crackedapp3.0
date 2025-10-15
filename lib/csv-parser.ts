import Papa from 'papaparse';
import { CSVRow, AlumniProfile } from './types';

export class CSVParser {
  static parseCSV(csvContent: string): CSVRow[] {
    const results = Papa.parse<CSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Normalize headers to match our CSVRow interface
        const normalizedHeaders: { [key: string]: string } = {
          'Profile Name': 'Profile_Name',
          'Profile_Picture_URL': 'Profile_Picture_URL',
          'addressWithoutCountry': 'addressWithoutCountry',
          'high school': 'high_school',
          'high_school_logo': 'high_school_logo',
          'DVHS class of': 'DVHS class of',
          'College_1_Name': 'College_1_Name',
          'College_1_Degree': 'College_1_Degree',
          'College_1_Logo': 'College_1_Logo',
          'College_2_Name': 'College_2_Name',
          'College_2_Degree': 'College_2_Degree',
          'College_2_Logo': 'College_2_Logo',
          'College_3_Name': 'College_3_Name',
          'College_3_Degree': 'College_3_Degree',
          'College_3_Logo': 'College_3_Logo',
          'Experience_1_Company': 'Experience_1_Company',
          'Experience_1_Role': 'Experience_1_Role',
          'Experience_1_Logo': 'Experience_1_Logo',
          'Experience_2_Company': 'Experience_2_Company',
          'Experience_2_Role': 'Experience_2_Role',
          'Experience_2_Logo': 'Experience_2_Logo',
          'Experience_3_Company': 'Experience_3_Company',
          'Experience_3_Role': 'Experience_3_Role',
          'Experience_3_Logo': 'Experience_3_Logo',
          'Experience_4_Company': 'Experience_4_Company',
          'Experience_4_Role': 'Experience_4_Role',
          'Experience_4_Logo': 'Experience_4_Logo',
          'linkedinUrl': 'linkedinUrl',
          'Email': 'Email',
          'Phone number': 'Phone number'
        };
        
        return normalizedHeaders[header] || header;
      }
    });

    return results.data;
  }

  static csvRowToAlumniProfile(row: CSVRow): AlumniProfile {
    return {
      id: '',
      name: row['Profile_Name'] || '',
      location: row['addressWithoutCountry'] || '',
      profile_picture_url: row['Profile_Picture_URL'] || '',
      high_school: row['high_school'] || 'DVHS',
      dvhs_class_of: row['DVHS class of'] || '',
      college_1_name: row['College_1_Name'] || '',
      college_1_degree: row['College_1_Degree'] || '',
      college_1_logo: row['College_1_Logo'] || '',
      college_2_name: row['College_2_Name'] || '',
      college_2_degree: row['College_2_Degree'] || '',
      college_2_logo: row['College_2_Logo'] || '',
      college_3_name: row['College_3_Name'] || '',
      college_3_degree: row['College_3_Degree'] || '',
      college_3_logo: row['College_3_Logo'] || '',
      experience_1_company: row['Experience_1_Company'] || '',
      experience_1_role: row['Experience_1_Role'] || '',
      experience_1_logo: row['Experience_1_Logo'] || '',
      experience_2_company: row['Experience_2_Company'] || '',
      experience_2_role: row['Experience_2_Role'] || '',
      experience_2_logo: row['Experience_2_Logo'] || '',
      experience_3_company: row['Experience_3_Company'] || '',
      experience_3_role: row['Experience_3_Role'] || '',
      experience_3_logo: row['Experience_3_Logo'] || '',
      experience_4_company: row['Experience_4_Company'] || '',
      experience_4_role: row['Experience_4_Role'] || '',
      experience_4_logo: row['Experience_4_Logo'] || '',
      linkedin_url: row['linkedinUrl'] || '',
      email: row['Email'] || '',
      phone_number: row['Phone number'] || '',
      elo: 1000, // Default ELO for new profiles
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  static async uploadCSVData(csvContent: string): Promise<{
    success: boolean;
    message: string;
    stats: {
      total: number;
      updated: number;
      inserted: number;
      errors: number;
    };
  }> {
    try {
      const csvRows = this.parseCSV(csvContent);
      const stats = {
        total: csvRows.length,
        updated: 0,
        inserted: 0,
        errors: 0
      };

      // Import supabaseAdmin dynamically to avoid server-side import issues
      const { supabaseAdmin } = await import('./supabase');

      for (const row of csvRows) {
        try {
          // Convert CSV row to AlumniProfile
          const profile = this.csvRowToAlumniProfile(row);
          
          // Create insert data by removing auto-generated fields
          const insertData = {
            name: profile.name,
            location: profile.location,
            profile_picture_url: profile.profile_picture_url,
            high_school: profile.high_school,
            dvhs_class_of: profile.dvhs_class_of,
            college_1_name: profile.college_1_name,
            college_1_degree: profile.college_1_degree,
            college_1_logo: profile.college_1_logo,
            college_2_name: profile.college_2_name,
            college_2_degree: profile.college_2_degree,
            college_2_logo: profile.college_2_logo,
            college_3_name: profile.college_3_name,
            college_3_degree: profile.college_3_degree,
            college_3_logo: profile.college_3_logo,
            experience_1_company: profile.experience_1_company,
            experience_1_role: profile.experience_1_role,
            experience_1_logo: profile.experience_1_logo,
            experience_2_company: profile.experience_2_company,
            experience_2_role: profile.experience_2_role,
            experience_2_logo: profile.experience_2_logo,
            experience_3_company: profile.experience_3_company,
            experience_3_role: profile.experience_3_role,
            experience_3_logo: profile.experience_3_logo,
            experience_4_company: profile.experience_4_company,
            experience_4_role: profile.experience_4_role,
            experience_4_logo: profile.experience_4_logo,
            linkedin_url: profile.linkedin_url,
            elo: profile.elo,
            email: profile.email,
            phone_number: profile.phone_number
          };

          // Insert into database
          const { data, error } = await (supabaseAdmin as any)
            .from('alumni_profiles')
            .insert([insertData])
            .select()
            .single();

          if (error) {
            console.error('Error inserting profile:', error);
            stats.errors++;
          } else {
            stats.inserted++;
          }
        } catch (error) {
          console.error('Error processing row:', error);
          stats.errors++;
        }
      }

      const successMessage = `Successfully processed ${stats.total} profiles. ${stats.inserted} inserted, ${stats.updated} updated, ${stats.errors} errors.`;
      
      return {
        success: stats.errors === 0,
        message: successMessage,
        stats
      };

    } catch (error) {
      console.error('Error uploading CSV data:', error);
      return {
        success: false,
        message: `Error uploading CSV data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        stats: {
          total: 0,
          updated: 0,
          inserted: 0,
          errors: 1
        }
      };
    }
  }

  static validateCSVFormat(csvContent: string): {
    valid: boolean;
    errors: string[];
    requiredColumns: string[];
  } {
    const requiredColumns = [
      'Profile_Name',
      'addressWithoutCountry',
      'Profile_Picture_URL',
      'high_school',
      'DVHS class of',
      'linkedinUrl'
    ];

    try {
      const results = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true
      });

      const headers = results.meta.fields || [];
      const errors: string[] = [];

      // Check for required columns
      for (const column of requiredColumns) {
        if (!headers.includes(column)) {
          errors.push(`Missing required column: ${column}`);
        }
      }

      // Check for empty data
      if (results.data.length === 0) {
        errors.push('CSV file is empty or contains no valid data');
      }

      return {
        valid: errors.length === 0,
        errors,
        requiredColumns
      };

    } catch (error) {
      return {
        valid: false,
        errors: [`CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        requiredColumns
      };
    }
  }
}