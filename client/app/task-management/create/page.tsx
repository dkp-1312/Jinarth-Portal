'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { getAllAssignees, type Assignee } from '@/lib/api-utils';
import { useAuth } from '@/app/providers/auth-provider';

interface FormData {
  title: string;
  description: string;
  assignedToIds: string[];
  assignedToType: 'Student' | 'Intern' | 'Employee';
  assignToAll: boolean;
  roleFilter: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  tags: string;
  estimatedHours: string;
}

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export default function CreateTaskPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    assignedToIds: [],
    assignedToType: 'Student',
    assignToAll: false,
    roleFilter: '',
    dueDate: '',
    priority: 'Medium',
    tags: '',
    estimatedHours: '',
  });

  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [filteredAssignees, setFilteredAssignees] = useState<Assignee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdTask, setCreatedTask] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [roleFilterOptions, setRoleFilterOptions] = useState<string[]>([]);

  // Fetch students and interns on component mount
  useEffect(() => {
    const fetchAssignees = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch all assignees (students and interns)
        const allAssignees = await getAllAssignees(token);
        
        setAssignees(allAssignees);
        setFilteredAssignees(allAssignees);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch assignees:', err);
        setError('Failed to load students and interns');
        setLoading(false);
      }
    };

    fetchAssignees();
  }, [router]);

  // Filter assignees based on search query and type
  useEffect(() => {
    const filtered = assignees
      .filter((assignee) => assignee.type === formData.assignedToType)
      .filter((assignee) => (formData.roleFilter ? assignee.details === formData.roleFilter : true))
      .filter((assignee) => {
        const lowerQuery = searchQuery.toLowerCase();
        return (
          (assignee.name && assignee.name.toLowerCase().includes(lowerQuery)) ||
          (assignee.email && assignee.email.toLowerCase().includes(lowerQuery))
        );
      });
    setFilteredAssignees(filtered);
  }, [searchQuery, formData.assignedToType, formData.roleFilter, assignees]);

  useEffect(() => {
    const options = Array.from(
      new Set(
        assignees
          .filter((assignee) => assignee.type === formData.assignedToType)
          .map((assignee) => assignee.details)
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
    setRoleFilterOptions(options);
  }, [assignees, formData.assignedToType]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    field: keyof FormData
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAssigneeTypeChange = (type: 'Student' | 'Intern' | 'Employee') => {
    setFormData((prev) => ({
      ...prev,
      assignedToType: type,
      assignedToIds: [],
      assignToAll: false,
      roleFilter: '',
    }));
    setSearchQuery('');
    setShowDropdown(true);
  };

  const handleSelectAssignee = (assignee: Assignee) => {
    setFormData((prev) => {
      const exists = prev.assignedToIds.includes(assignee.id);
      return {
        ...prev,
        assignedToIds: exists
          ? prev.assignedToIds.filter((id) => id !== assignee.id)
          : [...prev.assignedToIds, assignee.id],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.description.trim() || !formData.dueDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.assignToAll && formData.assignedToIds.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const taskData = {
        title: formData.title,
        description: formData.description,
        assignedToType: formData.assignedToType,
        assignToAll: formData.assignToAll,
        assignedToIds: formData.assignToAll ? [] : formData.assignedToIds,
        roleFilter: formData.roleFilter,
        dueDate: formData.dueDate,
        priority: formData.priority,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : undefined,
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create task');
        return;
      }

      setSuccess(true);
      setCreatedTask(data);

      // Reset form
      setFormData({
        title: '',
        description: '',
        assignedToIds: [],
        assignedToType: 'Student',
        assignToAll: false,
        roleFilter: '',
        dueDate: '',
        priority: 'Medium',
        tags: '',
        estimatedHours: '',
      });
      setSearchQuery('');

      // Redirect to tasks page after 5 seconds
      setTimeout(() => {
        router.push('/task-management/all');
      }, 5000);
    } catch (err) {
      console.error('Error creating task:', err);
      setError('An error occurred while creating the task');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b bg-white">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Create Task</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b bg-white">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Create Task</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Create New Task</h1>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                <h2 className="text-lg font-semibold text-green-800 mb-2">✓ Task Created Successfully</h2>
                <p className="text-green-700 mb-2">
                  Task "<strong>{createdTask?.title}</strong>" has been assigned to{' '}
                  <strong>{createdTask?.assignedTo?.length || 0} users</strong> ({createdTask?.assignedToType})
                </p>
                <p className="text-green-600 text-sm">Redirecting to tasks page in 5 seconds...</p>
              </div>
            )}

            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">Task Title *</label>
                  <Input
                    type="text"
                    placeholder="e.g., Complete Project Report"
                    value={formData.title}
                    onChange={(e) => handleInputChange(e, 'title')}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    className="w-full min-h-[120px] px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Describe the task details..."
                    value={formData.description}
                    onChange={(e) => handleInputChange(e, 'description')}
                    required
                  />
                </div>

                {/* Assignee Type Selection */}
                <div>
                  <label className="block text-sm font-medium mb-3">Assign To Type *</label>
                  <div className="flex gap-4 mb-2">
                    <Button
                      type="button"
                      variant={formData.assignedToType === 'Student' ? 'default' : 'outline'}
                      onClick={() => handleAssigneeTypeChange('Student')}
                      className="flex-1"
                    >
                      Student ({assignees.filter(a => a.type === 'Student').length})
                    </Button>
                    <Button
                      type="button"
                      variant={formData.assignedToType === 'Intern' ? 'default' : 'outline'}
                      onClick={() => handleAssigneeTypeChange('Intern')}
                      className="flex-1"
                    >
                      Intern ({assignees.filter(a => a.type === 'Intern').length})
                    </Button>
                    {(isAdmin) && (
                      <Button
                        type="button"
                        variant={formData.assignedToType === 'Employee' ? 'default' : 'outline'}
                        onClick={() => handleAssigneeTypeChange('Employee')}
                        className="flex-1"
                      >
                        Employee ({assignees.filter(a => a.type === 'Employee').length})
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {assignees.filter(a => a.type === formData.assignedToType).length} {formData.assignedToType.toLowerCase()}s available
                  </p>
                </div>

                {/* Role Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {formData.assignedToType === 'Student' && 'Course Filter'}
                    {formData.assignedToType === 'Employee' && 'Designation Filter'}
                    {formData.assignedToType === 'Intern' && 'Department Filter'}
                  </label>
                  <select
                    value={formData.roleFilter}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        roleFilter: e.target.value,
                        assignedToIds: [],
                      }))
                    }
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">All</option>
                    {roleFilterOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assignment Mode */}
                <div>
                  <label className="block text-sm font-medium mb-3">Assignment Mode *</label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={formData.assignToAll ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          assignToAll: true,
                          assignedToIds: [],
                        }))
                      }
                    >
                      All {formData.assignedToType}s
                    </Button>
                    <Button
                      type="button"
                      variant={!formData.assignToAll ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          assignToAll: false,
                        }))
                      }
                    >
                      Selected Users
                    </Button>
                  </div>
                </div>

                {/* Assignee Selection */}
                {!formData.assignToAll && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select {formData.assignedToType} Users *
                    <span className="text-xs text-muted-foreground ml-2">
                      ({filteredAssignees.length} available)
                    </span>
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder={`Search ${formData.assignedToType.toLowerCase()} by name or email...`}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      required={formData.assignedToIds.length === 0}
                    />
                    {showDropdown && filteredAssignees.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 border border-input rounded-md bg-background shadow-lg max-h-64 overflow-y-auto">
                        <div className="p-2 text-xs text-muted-foreground border-b small">
                          Showing {Math.min(filteredAssignees.length, 10)} of {filteredAssignees.length}
                        </div>
                        {filteredAssignees.slice(0, 50).map((assignee) => (
                          <button
                            key={assignee.id}
                            type="button"
                            onClick={() => handleSelectAssignee(assignee)}
                            className="w-full text-left px-3 py-2 hover:bg-accent text-sm border-b last:border-b-0 transition-colors"
                          >
                            <div className="font-medium">
                              {formData.assignedToIds.includes(assignee.id) ? '✓ ' : ''}{assignee.name}
                            </div>
                            <div className="text-xs text-muted-foreground">{assignee.email}</div>
                          </button>
                        ))}
                      </div>
                    )}
                    {showDropdown && filteredAssignees.length === 0 && (
                      <div className="absolute z-10 w-full mt-1 border border-input rounded-md bg-background shadow-lg p-3 text-sm text-muted-foreground">
                        {searchQuery 
                          ? `No ${formData.assignedToType.toLowerCase()}s match "${searchQuery}"`
                          : `No ${formData.assignedToType.toLowerCase()}s available`}
                      </div>
                    )}
                  </div>
                  {formData.assignedToIds.length > 0 && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm font-medium text-green-800">
                        ✓ Selected Users: {formData.assignedToIds.length}
                      </p>
                    </div>
                  )}
                </div>
                )}

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium mb-2">Due Date *</label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange(e, 'dueDate')}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange(e, 'priority')}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                  <Input
                    type="text"
                    placeholder="e.g., urgent, report, review"
                    value={formData.tags}
                    onChange={(e) => handleInputChange(e, 'tags')}
                  />
                </div>

                {/* Estimated Hours */}
                <div>
                  <label className="block text-sm font-medium mb-2">Estimated Hours</label>
                  <Input
                    type="number"
                    placeholder="0"
                    min="0"
                    max="500"
                    value={formData.estimatedHours}
                    onChange={(e) => handleInputChange(e, 'estimatedHours')}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? 'Creating...' : 'Create Task'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
      </main>
    </>
  );
}
