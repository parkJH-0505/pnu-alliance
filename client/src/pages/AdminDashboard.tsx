import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"applications" | "events" | "gallery">("applications");

  const { data: applications = [] } = trpc.applications.list.useQuery(undefined, { enabled: !!user });
  const { data: events = [] } = trpc.events.list.useQuery(undefined, { enabled: !!user });
  const { data: galleryImages = [] } = trpc.gallery.list.useQuery(undefined, { enabled: !!user });

  const updateStatusMutation = trpc.applications.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("신청 상태가 업데이트되었습니다.");
    },
    onError: () => {
      toast.error("상태 업데이트 실패");
    },
  });

  const deleteEventMutation = trpc.events.delete.useMutation({
    onSuccess: () => {
      toast.success("이벤트가 삭제되었습니다.");
    },
    onError: () => {
      toast.error("이벤트 삭제 실패");
    },
  });

  const deleteGalleryMutation = trpc.gallery.delete.useMutation({
    onSuccess: () => {
      toast.success("이미지가 삭제되었습니다.");
    },
    onError: () => {
      toast.error("이미지 삭제 실패");
    },
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  const pendingApplications = applications.filter(a => a.status === "pending");
  const approvedApplications = applications.filter(a => a.status === "approved");
  const rejectedApplications = applications.filter(a => a.status === "rejected");

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">관리자 대시보드</h1>
          <p className="text-muted-foreground mt-2">PNU Alliance 커뮤니티 관리</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">대기 중인 신청</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingApplications.length}</div>
              <p className="text-xs text-muted-foreground">검토 필요</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">승인된 멤버</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedApplications.length}</div>
              <p className="text-xs text-muted-foreground">활성 멤버</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">등록된 이벤트</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
              <p className="text-xs text-muted-foreground">예정/지난 모임</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">갤러리 이미지</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{galleryImages.length}</div>
              <p className="text-xs text-muted-foreground">업로드된 사진</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex gap-4">
            {(["applications", "events", "gallery"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "applications" && "합류 신청"}
                {tab === "events" && "이벤트"}
                {tab === "gallery" && "갤러리"}
              </button>
            ))}
          </div>
        </div>

        {/* Applications Tab */}
        {activeTab === "applications" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-4">합류 신청 관리</h2>
              {pendingApplications.length === 0 ? (
                <p className="text-muted-foreground">대기 중인 신청이 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {pendingApplications.map((app) => (
                    <Card key={app.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>{app.name}</CardTitle>
                            <CardDescription>{app.email}</CardDescription>
                          </div>
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            {app.status === "pending" ? "대기" : app.status === "approved" ? "승인" : "거절"}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">직군</p>
                            <p className="font-medium">{app.industry}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">소속</p>
                            <p className="font-medium">{app.company}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">졸업연도</p>
                            <p className="font-medium">{app.graduationYear}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">전공</p>
                            <p className="font-medium">{app.major}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">합류 동기</p>
                          <p className="text-sm mt-1">{app.motivation}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: app.id,
                                status: "approved",
                                tier: "ground-crew",
                              })
                            }
                            disabled={updateStatusMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {updateStatusMutation.isPending ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Check size={14} />
                            )}
                            승인
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: app.id,
                                status: "rejected",
                              })
                            }
                            disabled={updateStatusMutation.isPending}
                            variant="destructive"
                          >
                            {updateStatusMutation.isPending ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <X size={14} />
                            )}
                            거절
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-4">이벤트 관리</h2>
              {events.length === 0 ? (
                <p className="text-muted-foreground">등록된 이벤트가 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <Card key={event.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>{event.title}</CardTitle>
                            <CardDescription>{event.location}</CardDescription>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => deleteEventMutation.mutate({ id: event.id })}
                            disabled={deleteEventMutation.isPending}
                            variant="destructive"
                          >
                            {deleteEventMutation.isPending ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <X size={14} />
                            )}
                            삭제
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p>
                          <span className="text-muted-foreground">날짜:</span> {new Date(event.date).toLocaleDateString("ko-KR")}
                        </p>
                        <p>
                          <span className="text-muted-foreground">참석:</span> {0 || 0} / {event.capacity || "무제한"}
                        </p>
                        {event.description && (
                          <p>
                            <span className="text-muted-foreground">설명:</span> {event.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === "gallery" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-4">갤러리 관리</h2>
              {galleryImages.length === 0 ? (
                <p className="text-muted-foreground">업로드된 이미지가 없습니다.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.imageUrl}
                        alt={image.title || "Gallery image"}
                        className="w-full h-40 object-cover rounded border"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                        <Button
                          size="sm"
                          onClick={() => deleteGalleryMutation.mutate({ id: image.id })}
                          disabled={deleteGalleryMutation.isPending}
                          variant="destructive"
                        >
                          {deleteGalleryMutation.isPending ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <X size={14} />
                          )}
                          삭제
                        </Button>
                      </div>
                      {image.title && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">{image.title}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
