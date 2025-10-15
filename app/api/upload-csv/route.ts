import { NextRequest, NextResponse } from 'next/server';
import { CSVParser } from '@/lib/csv-parser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, message: 'File must be a CSV' },
        { status: 400 }
      );
    }

    // Read file content
    const text = await file.text();
    
    // Validate CSV format
    const validation = CSVParser.validateCSVFormat(text);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Invalid CSV format: ${validation.errors.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Upload data
    const result = await CSVParser.uploadCSVData(text);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        stats: { total: 0, updated: 0, inserted: 0, errors: 1 }
      },
      { status: 500 }
    );
  }
}
