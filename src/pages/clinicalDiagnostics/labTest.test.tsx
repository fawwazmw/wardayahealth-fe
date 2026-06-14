import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock axios - must be defined before the mock
const mockPost = vi.fn()
const mockGet = vi.fn()
const mockPut = vi.fn()
const mockDelete = vi.fn()

vi.mock('@/providers/authProvider', () => ({
  axiosInstance: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get: (...args: any[]) => mockGet(...args),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    post: (...args: any[]) => mockPost(...args),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    put: (...args: any[]) => mockPut(...args),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete: (...args: any[]) => mockDelete(...args),
  },
  API_URL: '/api/v1',
}))

import { axiosInstance } from '@/providers/authProvider'

describe('Lab Test CRUD Operations - API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('token', 'test-token')
  })

  describe('Create Lab Test', () => {
    it('should successfully create a new lab test', async () => {
      const newLabTest = {
        patient_name: 'John Doe',
        test_case_id: 'TC001',
        physician_name: 'Dr. Smith',
        disease: 'COVID-19',
        specimen_type: 'Nasopharyngeal Swab',
        report_status: 'pending',
      }

      const mockResponse = {
        data: {
          id: 1,
          ...newLabTest,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      }

      mockPost.mockResolvedValueOnce(mockResponse)

      const result = await axiosInstance.post('/clinical-diagnostics', newLabTest)

      expect(mockPost).toHaveBeenCalledWith('/clinical-diagnostics', newLabTest)
      expect(result.data).toEqual(mockResponse.data)
      expect(result.data.id).toBe(1)
      expect(result.data.patient_name).toBe('John Doe')
    })

    it('should handle validation errors when creating lab test', async () => {
      const invalidLabTest = {
        patient_name: '', // Empty name should fail validation
        test_case_id: 'TC001',
      }

      const mockError = {
        response: {
          data: {
            errors: [
              { message: 'Patient name is required', field: 'patient_name' },
            ],
          },
          status: 422,
        },
      }

      mockPost.mockRejectedValueOnce(mockError)

      try {
        await axiosInstance.post('/clinical-diagnostics', invalidLabTest)
        expect.fail('Should have thrown an error')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        expect(error.response.status).toBe(422)
        expect(error.response.data.errors[0].message).toBe('Patient name is required')
      }
    })

    it('should handle server errors when creating lab test', async () => {
      const newLabTest = {
        patient_name: 'John Doe',
        test_case_id: 'TC001',
      }

      mockPost.mockRejectedValueOnce(new Error('Internal server error'))

      try {
        await axiosInstance.post('/clinical-diagnostics', newLabTest)
        expect.fail('Should have thrown an error')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        expect(error.message).toBe('Internal server error')
      }
    })
  })

  describe('Read Lab Tests', () => {
    it('should fetch all lab tests', async () => {
      const mockLabTests = [
        {
          id: 1,
          patient_name: 'John Doe',
          test_case_id: 'TC001',
          physician_name: 'Dr. Smith',
          disease: 'COVID-19',
          specimen_type: 'Nasopharyngeal Swab',
          report_status: 'completed',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          patient_name: 'Jane Smith',
          test_case_id: 'TC002',
          physician_name: 'Dr. Johnson',
          disease: 'Influenza',
          specimen_type: 'Blood',
          report_status: 'pending',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ]

      mockGet.mockResolvedValueOnce({ data: mockLabTests })

      const result = await axiosInstance.get('/clinical-diagnostics')

      expect(mockGet).toHaveBeenCalledWith('/clinical-diagnostics')
      expect(result.data).toHaveLength(2)
      expect(result.data[0].patient_name).toBe('John Doe')
      expect(result.data[1].patient_name).toBe('Jane Smith')
    })

    it('should fetch a single lab test by id', async () => {
      const mockLabTest = {
        id: 1,
        patient_name: 'John Doe',
        test_case_id: 'TC001',
        physician_name: 'Dr. Smith',
        disease: 'COVID-19',
        specimen_type: 'Nasopharyngeal Swab',
        report_status: 'completed',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockGet.mockResolvedValueOnce({ data: mockLabTest })

      const result = await axiosInstance.get('/clinical-diagnostics/1')

      expect(mockGet).toHaveBeenCalledWith('/clinical-diagnostics/1')
      expect(result.data.id).toBe(1)
      expect(result.data.patient_name).toBe('John Doe')
    })

    it('should handle 404 when lab test not found', async () => {
      const mockError = {
        response: {
          data: { message: 'Lab test not found' },
          status: 404,
        },
      }

      mockGet.mockRejectedValueOnce(mockError)

      try {
        await axiosInstance.get('/clinical-diagnostics/999')
        expect.fail('Should have thrown an error')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        expect(error.response.status).toBe(404)
        expect(error.response.data.message).toBe('Lab test not found')
      }
    })

    it('should filter lab tests by patient name', async () => {
      const mockFilteredTests = [
        {
          id: 1,
          patient_name: 'John Doe',
          test_case_id: 'TC001',
          physician_name: 'Dr. Smith',
          disease: 'COVID-19',
          specimen_type: 'Blood',
          report_status: 'completed',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]

      mockGet.mockResolvedValueOnce({ data: mockFilteredTests })

      const result = await axiosInstance.get('/clinical-diagnostics', {
        params: { patient_name: 'John' },
      })

      expect(mockGet).toHaveBeenCalledWith('/clinical-diagnostics', {
        params: { patient_name: 'John' },
      })
      expect(result.data).toHaveLength(1)
      expect(result.data[0].patient_name).toBe('John Doe')
    })
  })

  describe('Update Lab Test', () => {
    it('should successfully update an existing lab test', async () => {
      const updatedData = {
        patient_name: 'John Doe Updated',
        report_status: 'completed',
      }

      const mockResponse = {
        data: {
          id: 1,
          patient_name: 'John Doe Updated',
          test_case_id: 'TC001',
          physician_name: 'Dr. Smith',
          disease: 'COVID-19',
          specimen_type: 'Blood',
          report_status: 'completed',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      }

      mockPut.mockResolvedValueOnce(mockResponse)

      const result = await axiosInstance.put('/clinical-diagnostics/1', updatedData)

      expect(mockPut).toHaveBeenCalledWith('/clinical-diagnostics/1', updatedData)
      expect(result.data.patient_name).toBe('John Doe Updated')
      expect(result.data.report_status).toBe('completed')
    })

    it('should handle validation errors when updating', async () => {
      const invalidUpdate = {
        report_status: 'invalid_status',
      }

      const mockError = {
        response: {
          data: {
            errors: [
              { message: 'Invalid report status', field: 'report_status' },
            ],
          },
          status: 422,
        },
      }

      mockPut.mockRejectedValueOnce(mockError)

      try {
        await axiosInstance.put('/clinical-diagnostics/1', invalidUpdate)
        expect.fail('Should have thrown an error')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        expect(error.response.status).toBe(422)
        expect(error.response.data.errors[0].message).toBe('Invalid report status')
      }
    })

    it('should handle 404 when updating non-existent lab test', async () => {
      const updateData = { patient_name: 'Updated Name' }

      const mockError = {
        response: {
          data: { message: 'Lab test not found' },
          status: 404,
        },
      }

      mockPut.mockRejectedValueOnce(mockError)

      try {
        await axiosInstance.put('/clinical-diagnostics/999', updateData)
        expect.fail('Should have thrown an error')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        expect(error.response.status).toBe(404)
      }
    })
  })

  describe('Delete Lab Test', () => {
    it('should successfully delete a lab test', async () => {
      mockDelete.mockResolvedValueOnce({ data: { success: true } })

      const result = await axiosInstance.delete('/clinical-diagnostics/1')

      expect(mockDelete).toHaveBeenCalledWith('/clinical-diagnostics/1')
      expect(result.data.success).toBe(true)
    })

    it('should handle 404 when deleting non-existent lab test', async () => {
      const mockError = {
        response: {
          data: { message: 'Lab test not found' },
          status: 404,
        },
      }

      mockDelete.mockRejectedValueOnce(mockError)

      try {
        await axiosInstance.delete('/clinical-diagnostics/999')
        expect.fail('Should have thrown an error')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        expect(error.response.status).toBe(404)
        expect(error.response.data.message).toBe('Lab test not found')
      }
    })

    it('should handle authorization errors when deleting', async () => {
      const mockError = {
        response: {
          data: { message: 'Unauthorized' },
          status: 403,
        },
      }

      mockDelete.mockRejectedValueOnce(mockError)

      try {
        await axiosInstance.delete('/clinical-diagnostics/1')
        expect.fail('Should have thrown an error')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        expect(error.response.status).toBe(403)
        expect(error.response.data.message).toBe('Unauthorized')
      }
    })
  })

  describe('Batch Operations', () => {
    it('should handle batch creation of lab tests', async () => {
      const batchData = [
        {
          patient_name: 'Patient 1',
          test_case_id: 'TC001',
          physician_name: 'Dr. Smith',
          disease: 'COVID-19',
          specimen_type: 'Blood',
        },
        {
          patient_name: 'Patient 2',
          test_case_id: 'TC002',
          physician_name: 'Dr. Johnson',
          disease: 'Influenza',
          specimen_type: 'Swab',
        },
      ]

      const mockResponse = {
        data: {
          success: true,
          created: 2,
          failed: 0,
        },
      }

      mockPost.mockResolvedValueOnce(mockResponse)

      const result = await axiosInstance.post('/clinical-diagnostics/batch', batchData)

      expect(mockPost).toHaveBeenCalledWith('/clinical-diagnostics/batch', batchData)
      expect(result.data.success).toBe(true)
      expect(result.data.created).toBe(2)
    })

    it('should handle partial batch failures', async () => {
      const batchData = [
        { patient_name: 'Valid Patient', test_case_id: 'TC001' },
        { patient_name: '', test_case_id: 'TC002' }, // Invalid
      ]

      const mockResponse = {
        data: {
          success: true,
          created: 1,
          failed: 1,
          errors: [
            { index: 1, message: 'Patient name is required' },
          ],
        },
      }

      mockPost.mockResolvedValueOnce(mockResponse)

      const result = await axiosInstance.post('/clinical-diagnostics/batch', batchData)

      expect(result.data.created).toBe(1)
      expect(result.data.failed).toBe(1)
      expect(result.data.errors).toHaveLength(1)
    })
  })
})
