import React, { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import HabitToggle from "@/components/molecules/HabitToggle";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { habitService } from "@/services/api/habitService";
import { toast } from "react-toastify";

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [filteredHabits, setFilteredHabits] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: "",
    category: "Salud",
    target: "",
    unit: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categories = [
    { id: "all", label: "Todos", icon: "Grid3x3" },
    { id: "Salud", label: "Salud", icon: "Heart" },
    { id: "Ejercicio", label: "Ejercicio", icon: "Dumbbell" },
    { id: "Alimentación", label: "Alimentación", icon: "Apple" },
    { id: "Mental", label: "Mental", icon: "Brain" },
    { id: "Productividad", label: "Productividad", icon: "Target" }
  ];

  const loadHabits = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await habitService.getAllHabits();
      setHabits(data);
      setFilteredHabits(data);
    } catch (err) {
      setError("Error al cargar los hábitos");
      console.error("Habits load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHabits();
  }, []);

  useEffect(() => {
    let filtered = habits;
    
    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(habit => habit.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(habit =>
        habit.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredHabits(filtered);
  }, [habits, selectedCategory, searchTerm]);

  const handleToggleHabit = async (habitId) => {
    try {
      await habitService.toggleHabitStatus(habitId);
      await loadHabits(); // Reload to get updated status
      toast.success("¡Hábito actualizado!");
    } catch (err) {
      toast.error("Error al actualizar el hábito");
    }
  };

  const handleAddHabit = async (e) => {
    e.preventDefault();
    
    if (!newHabit.name.trim()) {
      toast.error("El nombre del hábito es obligatorio");
      return;
    }

    try {
      await habitService.createHabit({
        ...newHabit,
        target: newHabit.target ? parseInt(newHabit.target) : null
      });
      
      await loadHabits();
      setShowAddForm(false);
      setNewHabit({ name: "", category: "Salud", target: "", unit: "" });
      toast.success("¡Hábito creado exitosamente!");
    } catch (err) {
      toast.error("Error al crear el hábito");
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este hábito?")) {
      try {
        await habitService.deleteHabit(habitId);
        await loadHabits();
        toast.success("Hábito eliminado");
      } catch (err) {
        toast.error("Error al eliminar el hábito");
      }
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadHabits} />;

  const todayStats = {
    completed: habits.filter(h => h.status === "completed").length,
    partial: habits.filter(h => h.status === "partial").length,
    total: habits.length
  };

  const completionPercentage = todayStats.total > 0 
    ? Math.round((todayStats.completed / todayStats.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl lg:text-3xl mb-2">
              Mis Hábitos
            </h1>
            <p className="text-purple-100">
              {completionPercentage}% completado hoy - ¡Excelente progreso! 🎯
            </p>
          </div>
          <div className="hidden md:block">
            <ApperIcon name="Target" className="h-16 w-16 text-purple-200" />
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{todayStats.completed}</div>
          <div className="text-sm text-gray-600">Completados</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{todayStats.partial}</div>
          <div className="text-sm text-gray-600">Parciales</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{todayStats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Buscar hábitos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap"
                >
                  <ApperIcon name={category.icon} className="h-4 w-4 mr-2" />
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={() => setShowAddForm(true)}>
            <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
            Agregar Hábito
          </Button>
        </div>
      </Card>

      {/* Add Habit Form */}
      {showAddForm && (
        <Card className="p-6">
          <form onSubmit={handleAddHabit} className="space-y-4">
            <h3 className="font-display font-semibold text-lg mb-4">Nuevo Hábito</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre del hábito"
                value={newHabit.name}
                onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                placeholder="Ej: Beber 8 vasos de agua"
                required
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Categoría
                </label>
                <select
                  value={newHabit.category}
                  onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-primary"
                >
                  {categories.slice(1).map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Meta (opcional)"
                type="number"
                value={newHabit.target}
                onChange={(e) => setNewHabit({ ...newHabit, target: e.target.value })}
                placeholder="8"
              />

              <Input
                label="Unidad (opcional)"
                value={newHabit.unit}
                onChange={(e) => setNewHabit({ ...newHabit, unit: e.target.value })}
                placeholder="vasos, minutos, veces..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setNewHabit({ name: "", category: "Salud", target: "", unit: "" });
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Crear Hábito
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Habits List */}
      {filteredHabits.length > 0 ? (
        <div className="space-y-4">
{filteredHabits.map((habit, index) => (
            <Card key={habit?.id ? `habit-${habit.id}` : `habit-${index}`} className="p-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <HabitToggle
                    habit={habit}
                    status={habit?.status}
                    onToggle={handleToggleHabit}
                  />
                </div>
                <div className="px-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteHabit(habit?.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <ApperIcon name="Trash2" className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty
          title="No hay hábitos"
          description={searchTerm || selectedCategory !== "all" 
            ? "No se encontraron hábitos con los filtros aplicados" 
            : "Comienza agregando tu primer hábito para el reto"}
          icon="Target"
          actionText="Agregar Primer Hábito"
          onAction={() => setShowAddForm(true)}
        />
      )}

      {/* Quick Tips */}
      <Card className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
        <div className="flex items-start space-x-4">
          <div className="bg-emerald-100 p-3 rounded-lg">
            <ApperIcon name="Lightbulb" className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">💡 Consejos para el éxito</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Empieza con 3-5 hábitos pequeños y alcanzables</li>
              <li>• Vincula nuevos hábitos con rutinas existentes</li>
              <li>• Celebra cada pequeño logro en tu progreso</li>
              <li>• La constancia es más importante que la perfección</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Habits;