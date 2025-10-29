import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  Edit, 
  Mail, 
  Phone, 
  Shield, 
  Star, 
  User as UserIcon, 
  UserCheck,
  Award,
  Clock
} from "lucide-react";
import { useEffect, useState } from "react";
import { UserServices } from "@/services/user.service";
import type { User } from "@/models/user";
import { toast } from "sonner";

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<User>>({});

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await UserServices.getUserProfile();
      if (response.isSuccess && response.result) {
        setUser(response.result);
        setEditData(response.result);
      } else {
        toast.error("Không thể tải thông tin profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Có lỗi xảy ra khi tải thông tin profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (user) {
        const response = await UserServices.update(user.id.toString(), editData);
        if (response.isSuccess) {
          setUser({ ...user, ...editData });
          setIsEditing(false);
          toast.success("Cập nhật thông tin thành công");
        } else {
          toast.error("Cập nhật thông tin thất bại");
        }
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
      toast.error("Có lỗi xảy ra khi cập nhật thông tin");
    }
  };

  const handleCancel = () => {
    setEditData(user || {});
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof User, value: string) => {
    setEditData((prev: Partial<User>) => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Chưa cập nhật";
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">Không thể tải thông tin profile</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hồ sơ cá nhân</h1>
          <p className="text-gray-600">Quản lý thông tin cá nhân và cài đặt tài khoản</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    {user.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                    ) : (
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-semibold">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {user.fullName}
                  </h2>
                  
                  <p className="text-gray-600 mb-4">{user.email}</p>
                  
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Hoạt động" : "Tạm khóa"}
                    </Badge>
                    {user.emailConfirmed && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Đã xác thực
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-center">
                      <Star className="h-4 w-4 mr-2 text-yellow-500" />
                      <span>Điểm: {user.score}</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <Award className="h-4 w-4 mr-2 text-blue-500" />
                      <span>ID: {user.id}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Thông tin chi tiết</CardTitle>
                {!isEditing ? (
                  <Button onClick={handleEdit} variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button onClick={handleSave} size="sm">
                      Lưu
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      Hủy
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2" />
                    Thông tin cơ bản
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Họ và tên</Label>
                      {isEditing ? (
                        <Input
                          id="fullName"
                          value={editData.fullName || ''}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{user.fullName}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="userName">Tên đăng nhập</Label>
                      {isEditing ? (
                        <Input
                          id="userName"
                          value={editData.userName || ''}
                          onChange={(e) => handleInputChange('userName', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{user.userName}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <div className="mt-1 flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <p className="text-gray-900">{user.email}</p>
                        {user.emailConfirmed && (
                          <Shield className="h-4 w-4 ml-2 text-green-500" />
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phoneNumber">Số điện thoại</Label>
                      {isEditing ? (
                        <Input
                          id="phoneNumber"
                          value={editData.phoneNumber || ''}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <div className="mt-1 flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <p className="text-gray-900">{user.phoneNumber}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="gender">Giới tính</Label>
                      {isEditing ? (
                        <Input
                          id="gender"
                          value={editData.gender || ''}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="mt-1"
                          placeholder="Nam/Nữ/Khác"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{user.gender || "Chưa cập nhật"}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="birthday">Ngày sinh</Label>
                      {isEditing ? (
                        <Input
                          id="birthday"
                          type="date"
                          value={editData.birthday ? editData.birthday.split('T')[0] : ''}
                          onChange={(e) => handleInputChange('birthday', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <div className="mt-1 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <p className="text-gray-900">{formatDate(user.birthday)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Account Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Thông tin tài khoản
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Trạng thái tài khoản</Label>
                      <div className="mt-1">
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Hoạt động" : "Tạm khóa"}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label>Xác thực email</Label>
                      <div className="mt-1">
                        <Badge variant={user.emailConfirmed ? "default" : "secondary"}>
                          {user.emailConfirmed ? "Đã xác thực" : "Chưa xác thực"}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label>Điểm số</Label>
                      <div className="mt-1 flex items-center">
                        <Star className="h-4 w-4 mr-2 text-yellow-500" />
                        <p className="text-gray-900 font-semibold">{user.score}</p>
                      </div>
                    </div>

                    <div>
                      <Label>Ngày tạo</Label>
                      <div className="mt-1 flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
