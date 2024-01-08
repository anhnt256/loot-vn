import MissionList from "./_component/MissionList/MissionList";

const Missions = () => {
  return (
    <div className="flex flex-col p-5 gap-4">
      <div className="bg-white shadow-lg rounded-lg p-4 w-full">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold mb-2">
            <div>Trung tâm nhiệm vụ</div>
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex mr-4">
              <div className="text-xs">Số lần đổi thưởng trong ngày 0 / 5</div>
            </div>
          </div>
        </div>

        <div id="calendar" className="overflow-y-auto">
          <MissionList />
        </div>
      </div>
    </div>
  );
};

export default Missions;
