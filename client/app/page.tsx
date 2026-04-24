"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/providers/auth-provider"
// Ensure these are imported from your UI library (e.g., shadcn/ui)
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Award, Users, Target, Globe } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        if (user.role === 'Student') {
          router.push("/student-portal")
        } else if (user.role === 'Intern') {
          router.push("/intern-portal")
        } else if (user.role === 'Employee') {
          router.push("/employee-portal")
        } else {
          router.push("/dashboard")
        }
      } else if (!isAuthenticated) {
        router.push("/login")
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Define your data arrays here (or import them)
  const services = [
    { title: "Web Development", description: "Modern web apps", icon: Globe },
    // ... add other services
  ]
  const values = [
    { title: "Quality", description: "High standards" },
    // ... add other values
  ]

  return (
    <>
      <main className="p-8">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Services Section */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Our Services</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, idx) => {
                const Icon = service.icon
                return (
                  <Card key={idx} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <CardTitle className="text-lg">{service.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{service.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Core Values */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Core Values</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {values.map((value, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">{value.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Technology Stack */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Technology Stack</h2>
            <Card>
              <CardHeader>
                <CardTitle>Technologies We Work With</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Frontend</h4>
                    <div className="flex flex-wrap gap-2">
                      {["React", "Next.js", "Vue.js", "TypeScript", "Tailwind CSS"].map((tech) => (
                        <Badge key={tech} variant="secondary">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Backend</h4>
                    <div className="flex flex-wrap gap-2">
                      {["Node.js", "Python", "MongoDB", "PostgreSQL", "AWS"].map((tech) => (
                        <Badge key={tech} variant="secondary">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Why Choose Us */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Why Choose Jinarth Infotech?</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: "Expert Team", desc: "Skilled developers with years of experience" },
                { title: "Timely Delivery", desc: "Projects delivered on time within budget" },
                { title: "24/7 Support", desc: "Continuous support and maintenance" },
              ].map((item, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2 text-blue-600">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <CardContent className="pt-8 text-center space-y-4">
              <h3 className="text-2xl font-bold">Ready to Transform Your Business?</h3>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Let's work together to bring your digital vision to life.
              </p>
              <div className="flex justify-center gap-4">
                <button className="px-8 py-2 bg-white text-blue-600 font-semibold rounded-lg">Get Started</button>
                <button className="px-8 py-2 border-2 border-white font-semibold rounded-lg">Contact Us</button>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </>
  )
}