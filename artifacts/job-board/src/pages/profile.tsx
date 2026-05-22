import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUserAuthContext } from "@/contexts";
import { useListApplications } from "@workspace/api-client-react";
import { useFileUpload } from "@/hooks/use-file-upload";
import {
  User, Mail, Phone, MapPin, FileText, Upload, Loader2, LogOut,
  Briefcase, CheckCircle, Clock, XCircle, Star
} from "lucide-react";
import { APPLICATION_STATUSES, STATUS_COLORS, timeAgo } from "@/lib/constants";
import { useForm } from "react-hook-form";

export default function Profile() {
  const { user, logout, updateProfile } = useUserAuthContext();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { uploadFile, isUploading, progress } = useFileUpload();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: applications } = useListApplications({ email: user?.email });

  const form = useForm({
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
      bio: user?.bio ?? "",
      location: user?.location ?? "",
    },
  });

  if (!user) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <User className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">You need to sign in to view your profile.</p>
            <Link href="/login"><Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">Sign In</Button></Link>
          </div>
        </div>
      </Layout>
    );
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setResumeFile(file);
  };

  const onSave = async (data: Record<string, string>) => {
    setSaving(true);
    try {
      let profileImageUrl = user.profileImageUrl ?? undefined;
      let resumeUrl = user.resumeUrl ?? undefined;

      if (avatarFile) {
        const r = await uploadFile(avatarFile);
        profileImageUrl = r.objectPath;
      }
      if (resumeFile) {
        const r = await uploadFile(resumeFile);
        resumeUrl = r.objectPath;
      }
      await updateProfile({ ...data, profileImageUrl, resumeUrl });
      toast({ title: "Profile saved!" });
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const statusIcon: Record<string, React.ReactNode> = {
    pending: <Clock className="w-4 h-4 text-yellow-500" />,
    reviewed: <Star className="w-4 h-4 text-blue-500" />,
    shortlisted: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    rejected: <XCircle className="w-4 h-4 text-red-500" />,
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-8 py-10 max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your personal info and track applications</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/30">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="w-4 h-4 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSave)} className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      {avatarPreview || user.profileImageUrl ? (
                        <img
                          src={avatarPreview ?? `/api/storage${user.profileImageUrl}`}
                          alt={user.name}
                          className="w-20 h-20 rounded-2xl object-cover border-2 border-border"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-3xl border-2 border-border">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="avatar" className="cursor-pointer">
                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-colors text-sm text-muted-foreground hover:text-primary">
                          <Upload className="w-3.5 h-3.5" />
                          Change Photo
                        </div>
                      </Label>
                      <input id="avatar" type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Full Name</Label>
                      <Input {...form.register("name")} />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5 text-muted-foreground"><Mail className="w-3.5 h-3.5" />Email</Label>
                      <Input value={user.email} disabled className="opacity-60" />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />Phone</Label>
                      <Input placeholder="+1 555-0100" {...form.register("phone")} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />Location</Label>
                      <Input placeholder="New York, NY" {...form.register("location")} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Bio</Label>
                      <Textarea rows={3} placeholder="Tell employers about yourself..." {...form.register("bio")} />
                    </div>
                  </div>

                  <div className="space-y-2 p-4 rounded-xl bg-muted/40 border border-border/60">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <FileText className="w-4 h-4 text-primary" />
                      Resume / CV
                    </Label>
                    {user.resumeUrl && (
                      <div className="flex items-center gap-2 mb-2">
                        <a href={`/api/storage${user.resumeUrl}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                          <FileText className="w-3 h-3" /> View current resume
                        </a>
                      </div>
                    )}
                    <div>
                      <Label htmlFor="resume" className="cursor-pointer">
                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-colors text-sm text-muted-foreground hover:text-primary">
                          <Upload className="w-3.5 h-3.5" />
                          {resumeFile ? resumeFile.name : "Upload Resume (PDF)"}
                        </div>
                      </Label>
                      <input id="resume" type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={handleResumeChange} />
                    </div>
                    {isUploading && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Uploading... {progress}%
                      </div>
                    )}
                  </div>

                  <Button type="submit" disabled={saving || isUploading} className="gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  My Applications
                </CardTitle>
                <CardDescription>{applications?.length ?? 0} submitted</CardDescription>
              </CardHeader>
              <CardContent>
                {!applications || applications.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No applications yet</p>
                    <Link href="/jobs"><Button size="sm" variant="link" className="mt-1 text-primary">Browse Jobs</Button></Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.map((app) => (
                      <div key={app.id} className="p-3 rounded-xl border border-border/60 hover:border-border transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link href={`/jobs/${app.jobId}`}>
                              <p className="font-medium text-sm hover:text-primary transition-colors line-clamp-1">{app.jobTitle}</p>
                            </Link>
                            <p className="text-xs text-muted-foreground">{app.company}</p>
                            <p className="text-xs text-muted-foreground mt-1">{timeAgo(app.createdAt)}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {statusIcon[app.status]}
                            <Badge className={`${STATUS_COLORS[app.status] ?? ""} text-xs capitalize border`}>{app.status}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xl mx-auto">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  {user.location && <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><MapPin className="w-3 h-3" />{user.location}</p>}
                  <p className="text-xs text-muted-foreground">Member since {new Date(user.createdAt).getFullYear()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
