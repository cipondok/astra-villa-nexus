import { Users, Shield, Home, ThumbsUp } from 'lucide-react';

interface AgentStats {
  totalAgents: number;
  verifiedAgents: number;
  propertiesSold: number;
  satisfactionRate: number;
}

interface AgentHeroBannerProps {
  stats?: AgentStats;
}

const AgentHeroBanner = ({ stats }: AgentHeroBannerProps) => {
  const statItems = [
    {
      icon: Users,
      value: stats?.totalAgents || 0,
      label: 'Total Agen',
      suffix: '+'
    },
    {
      icon: Shield,
      value: stats?.verifiedAgents || 0,
      label: 'Agen Terverifikasi',
      suffix: ''
    },
    {
      icon: Home,
      value: stats?.propertiesSold || 0,
      label: 'Properti Terjual',
      suffix: '+'
    },
    {
      icon: ThumbsUp,
      value: stats?.satisfactionRate || 0,
      label: 'Kepuasan',
      suffix: '%'
    }
  ];

  return (
    <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full" />
        <div className="absolute top-20 right-20 w-24 h-24 border-2 border-white rounded-full" />
        <div className="absolute bottom-10 left-1/4 w-16 h-16 border-2 border-white rounded-full" />
        <div className="absolute bottom-20 right-1/3 w-20 h-20 border-2 border-white rounded-full" />
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-[10%] animate-bounce" style={{ animationDuration: '3s' }}>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="absolute top-1/3 right-[20%] animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="absolute bottom-1/4 right-[15%] animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Home className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Cari Agen Properti
          </h1>
          <p className="text-lg sm:text-xl text-white/90 mb-8">
            Temukan agen properti terpercaya dan berpengalaman untuk membantu Anda menemukan properti impian
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {statItems.map((item, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20"
              >
                <item.icon className="h-6 w-6 text-white mx-auto mb-2" />
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  {item.value.toLocaleString()}{item.suffix}
                </div>
                <div className="text-sm text-white/80">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentHeroBanner;
