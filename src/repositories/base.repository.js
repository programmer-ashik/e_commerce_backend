class BaseRepository {
  constructor(model) {
    this.model = model;
  }
  // make data
  async create(data) {
    return await this.model.create(data);
  }
  //   find data by id
  async findById(id, populate = "") {
    return await this.model.findById(id).populate(populate);
  }
  async findOne(filter, populate = "", select = "") {
    return await this.model.findOne(filter).select(select).populate(populate);
  }
  async updateById(id, updateData) {
    return await this.model.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }
  async deleteById(id) {
    return await this.model.findByIdAndDelete(id);
  }
}
export default BaseRepository;
